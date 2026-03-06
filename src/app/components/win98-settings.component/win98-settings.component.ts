import {Component, ElementRef, Input, ViewChild, OnInit, signal, computed} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DesktopBackground} from '../../models/desktop-background.model';
import {ThemeService} from '../../services/theme.service';
import {WindowsDesktopSettingsService} from '../../services/desktop-settings.service';
import {ScreenSaverSettings} from '../../models/screen-saver-settings.model';
import {Observable, take} from 'rxjs';
import {Theme} from '../../models/theme.model';
import { Store } from '@ngrx/store';
import {selectAvailableThemes, selectCurrentTheme} from '../../selectors/theme.selectors';
import * as ThemeActions from '../../actions/theme.actions';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-win98-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, NgOptimizedImage],
  templateUrl: './win98-settings.component.html',
  styleUrls: ['./win98-settings.component.scss'],
})
export class Win98SettingsComponent implements OnInit {
  @Input() windowClose: () => void = () => {
  };

  themes$: Observable<Theme[]>;
  currentTheme$: Observable<Theme>;

  // Settings state (using Signals for better reactivity and cleaner templates)
  activePanel = signal('appearance');

  // Appearance settings
  draftTheme = signal<Theme | null>(null);
  selectedWallpaper = signal<string | undefined>('none');
  wallpaperPosition = signal<'center' | 'tile' | 'stretch'>('center');
  backgroundColor = signal('#008080');
  showCustomColorPicker = signal(false);
  customColor = signal('#008080');

  // Display settings
  resolution = signal('800x600');
  colorDepth = signal('16-bit (65,536 colors)');
  refreshRate = signal('60Hz');

  // Screen saver settings
  screenSaver = signal<'pipes' | 'clock' | 'none'>('none');
  screenSaverTimeout = signal(10);

  // Computed state
  resolvedWallpaperUrl = computed(() => {
    const theme = this.draftTheme();
    const wallpaper = this.selectedWallpaper();

    if (wallpaper && wallpaper !== 'none') {
      return wallpaper;
    }
    if (
      wallpaper === 'none' &&
      theme?.wallpaper?.wallpaperType === 'image' &&
      theme?.wallpaper?.wallpaperUrl
    ) {
      return theme.wallpaper.wallpaperUrl;
    }

    return null;
  });

  constructor(
    private themeService: ThemeService,
    private windowsDesktopSettingsService: WindowsDesktopSettingsService,
    private store: Store) {
    this.themes$ = this.store.select(selectAvailableThemes);
    this.currentTheme$ = this.store.select(selectCurrentTheme);

    // Initialize draft state from current theme
    this.currentTheme$.pipe(take(1)).subscribe(theme => {
      if (theme) {
        this.draftTheme.set(theme);
        if (theme.wallpaper) {
          this.selectedWallpaper.set(theme.wallpaper.wallpaperUrl || 'none');
          this.wallpaperPosition.set(theme.wallpaper.wallpaperPosition || 'center');
          this.backgroundColor.set(theme.wallpaper.backgroundColor || '#008080');
          this.customColor.set(theme.wallpaper.backgroundColor || '#008080');
        }
      }
    });
  }

  ngOnInit(): void {
    this.store.dispatch(ThemeActions.loadThemes());
  }

  // Windows 98 color palette
  colorPalette = [
    '#000000',
    '#800000',
    '#008000',
    '#808000',
    '#000080',
    '#800080',
    '#008080',
    '#C0C0C0',
    '#808080',
    '#FF0000',
    '#00FF00',
    '#FFFF00',
    '#0000FF',
    '#FF00FF',
    '#00FFFF',
    '#FFFFFF',
  ];

  // Predefined wallpapers
  wallpapers = [
    {name: 'None', value: 'none'},
    {name: 'Windows 98', value: 'assets/images/wallpapers/win98.jpg'},
    {name: 'Clouds', value: 'assets/images/wallpapers/clouds.jpg'},
    {name: 'Kuromi', value: 'assets/images/wallpapers/kuromi.jpg'},
  ];

  // Screen savers
  screenSavers = [
    {name: 'None', value: 'none'},
    {name: '3D Pipes', value: 'pipes'},
    {name: 'Clock', value: 'clock'},
  ];

  // Resolutions
  resolutions = ['640x480', '800x600', '1024x768', '1280x1024'];

  // Color depths
  colorDepths = [
    '8-bit (256 colors)',
    '16-bit (65,536 colors)',
    '24-bit (16.7 million colors)',
    '32-bit (True Color)',
  ];

  // Refresh rates
  refreshRates = ['60Hz', '70Hz', '75Hz', '85Hz', '100Hz'];

  @ViewChild('fileInput') fileInput!: ElementRef;

  setActivePanel(panel: string) {
    this.activePanel.set(panel);
  }

  selectWallpaper(wallpaper: string) {
    this.selectedWallpaper.set(wallpaper);
  }

  selectColor(color: string) {
    this.backgroundColor.set(color);
    this.customColor.set(color);
  }

  openFilePicker() {
    this.fileInput.nativeElement.click();
  }

  parseInt(value: string) {
    return parseInt(value, 10);
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        this.selectedWallpaper.set(result);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  toggleCustomColorPicker() {
    this.showCustomColorPicker.update(v => !v);
  }

  onOkClicked() {
    this.windowClose();
  }

  onScreenSaverPreviewClicked() {
    this.windowsDesktopSettingsService.applyScreenSaverSettings({
      ...this.buildScreenSaverSettings(),
      screenSaverTimeOut: 0,
      isScreenSaverPreview: true
    });
  }

  applySettings() {
    const selectedWallpaper = this.selectedWallpaper();
    const draftTheme = this.draftTheme();
    let background: DesktopBackground;

    if (selectedWallpaper === 'none' && draftTheme?.wallpaper) {
      background = {
        ...draftTheme.wallpaper
      };
    } else {
      background = {
        wallpaperType: this.getWallpaperType(selectedWallpaper),
        wallpaperUrl: selectedWallpaper,
        wallpaperPosition: this.wallpaperPosition(),
        backgroundColor: this.backgroundColor(),
      };
    }

    const selectedTheme = {...draftTheme, wallpaper: background} as Theme;
    const screenSaverSettings: ScreenSaverSettings = this.buildScreenSaverSettings();

    // Dispatch to store
    this.store.dispatch(ThemeActions.updateWallpaper({wallpaper: background}));
    this.store.dispatch(ThemeActions.selectTheme({theme: selectedTheme}));

    this.windowsDesktopSettingsService.applyScreenSaverSettings(screenSaverSettings);
  }

  selectTheme(theme: Theme) {
    this.draftTheme.set(theme);
  }

  private buildScreenSaverSettings(): ScreenSaverSettings {
    return {
      screenSaverEnabled: this.screenSaver() !== 'none',
      screenSaverType: this.screenSaver(),
      screenSaverTimeOut: this.screenSaverTimeout(),
      isScreenSaverPreview: false
    }
  }

  private getWallpaperType(wallpaper: string | undefined): 'none' | 'image' | 'color' {
    if (!wallpaper || wallpaper === 'none') {
      return this.backgroundColor() ? 'color' : 'none';
    }
    return 'image';
  }
}
