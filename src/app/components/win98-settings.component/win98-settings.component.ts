import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DesktopBackground} from '../../models/desktop-background.model';
import {ThemeService} from '../../services/theme.service';
import {WindowsDesktopSettingsService} from '../../services/desktop-settings.service';
import {ScreenSaverSettings} from '../../models/screen-saver-settings.model';

@Component({
  selector: 'app-win98-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './win98-settings.component.html',
  styleUrls: ['./win98-settings.component.scss'],
})
export class Win98SettingsComponent {
  @Input() windowClose: () => void = () => {
  };

  constructor(
    private themeService: ThemeService,
    private windowsDesktopSettingsService: WindowsDesktopSettingsService) {
  }

  // Settings state
  activePanel: string = 'appearance';

  // Appearance settings
  wallpaper: string = 'none';
  wallpaperPosition: 'center' | 'tile' | 'stretch' = 'center';
  backgroundColor: string = '#008080'; // Teal like Windows 98 default
  showCustomColorPicker: boolean = false;
  customColor: string = '#008080';

  // Display settings
  resolution: string = '800x600';
  colorDepth: string = '16-bit (65,536 colors)';
  refreshRate: string = '60Hz';

  // Screen saver settings
  screenSaver: 'pipes' | 'clock' | 'none' = 'none';
  screenSaverTimeout: number = 10;

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
    {name: 'Windows 98', value: '/assets/images/wallpapers/win98.jpg'},
    {name: 'Clouds', value: '/assets/images/wallpapers/clouds.jpg'},
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
    this.activePanel = panel;
  }

  selectWallpaper(wallpaper: string) {
    this.wallpaper = wallpaper;
  }

  selectColor(color: string) {
    this.backgroundColor = color;
    this.customColor = color;
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
        this.wallpaper = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  toggleCustomColorPicker() {
    this.showCustomColorPicker = !this.showCustomColorPicker;
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
    let backgroundSettings: DesktopBackground = {
      wallpaperType: this.getWallpaperType(),
      wallpaperUrl: this.wallpaper,
      wallpaperPosition: this.wallpaperPosition,
      backgroundColor: this.backgroundColor,
    };

    let screenSaverSettings: ScreenSaverSettings = this.buildScreenSaverSettings();

    this.themeService.setDesktopBackground(backgroundSettings);
    this.windowsDesktopSettingsService.applyScreenSaverSettings(screenSaverSettings);
  }


  private buildScreenSaverSettings(): ScreenSaverSettings {
    return {
      screenSaverEnabled: this.screenSaver !== 'none',
      screenSaverType: this.screenSaver,
      screenSaverTimeOut: this.screenSaverTimeout,
      isScreenSaverPreview: false
    }
  }

  private getWallpaperType(): 'none' | 'image' | 'color' {
    if (this.wallpaper === 'none') {
      if (this.backgroundColor) {
        return 'color';
      } else {
        return 'none';
      }
    } else {
      return 'image';
    }
  }
}
