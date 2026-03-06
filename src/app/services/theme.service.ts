import {Injectable} from '@angular/core';
import {Base64PngImage, Theme} from '../models/theme.model';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {DesktopBackground} from '../models/desktop-background.model';
import {StateService} from './state.service';
import {LocalStorageService} from '../utils/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private encodedImages: Base64PngImage[] = [
    {
      name: 'greyMesh',
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC',
    },
    {
      name: 'pinkMesh',
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAWSURBVBhXY/i/7uR/EGAEEQzrTzEAAID8DOjcxeeRAAAAAElFTkSuQmCC',
    },
    {
      name: 'tealMesh',
      value: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAAAVSURBVBhXY7A8uvs/CDCCCKtjexgAdYUMbhJf4hwAAAAASUVORK5CYII=',
    }
  ];


  private themes: Theme[] = [
    {
      id: 'windows98-default',
      name: 'Windows 98 Default',
      displayName: 'Windows 98 Default',
      colors: {
        text_color: '#000000',
        progress_color: '#000080',
        start_menu_decoration_color: '#000080',
        background_color: '#C0C0C0',
        background_color_dark: '#808080',
        background_color_light: '#FFFFFF',
        background: '#C0C0C0',
        white_backgrounds: '#FFFFFF',
        hover_background_color: '#000080',
        hover_text_color: '#FFFFFF',
        disabled_hover_text_color: '#808080',
        disabled_hover_background_color: '#C0C0C0',
        desktop_background: '#008080',
        selected_item_color: '#000080',
        selected_item_text_color: '#FFFFFF',
        title_bar_gradient_start: 'navy',
        title_bar_gradient_end: '#1084d0',
        task_bar_start_button_background_color: 'silver',
        task_bar_item_background: this.encodedImages[0].value //PinkMesh
      },
      wallpaper: {
        wallpaperType: 'color',
        backgroundColor: '#008080'
      }
    },
    {
      id: 'windows98-Pink',
      name: 'Windows 98 Pink',
      displayName: 'Windows 98 Pink',
      wallpaper: {
        wallpaperType: 'image',
        wallpaperUrl: 'assets/images/wallpapers/kuromi.jpg',
        backgroundColor: '#008080',
      },
      colors: {
        text_color: '#4a1d30',
        progress_color: '#d63384',
        start_menu_decoration_color: '#be0f68',
        background_color: '#ffc9e2',
        background_color_dark: '#db8eb6',
        background_color_light: '#fff0f5',
        background: '#ffe6f2',
        white_backgrounds: 'white',
        hover_background_color: ' #f0a3c0',
        hover_text_color: '#330a1a',
        disabled_hover_text_color: '#c29bb0',
        disabled_hover_background_color: '#f5dceb',
        desktop_background: '#b83b6b',
        selected_item_color: '#ff1493',
        selected_item_text_color: '#ffffff',
        title_bar_gradient_start: '#d4339a',
        title_bar_gradient_end: '#e666b1',
        task_bar_start_button_background_color: '#e666b1',
        task_bar_item_background: this.encodedImages[1].value //GreyMesh
      }
    },
    {
      id: 'windows98-Special',
      name: 'Windows 98 Special',
      displayName: 'Windows 98 Special',
      colors: {
        text_color: '#155e63',
        progress_color: '#39C5BB',
        start_menu_decoration_color: '#39C5BB',
        background_color: '#E0F7FA',
        background_color_dark: '#80CBC4',
        background_color_light: '#FFFFFF',
        background: '#E6FFFA',
        white_backgrounds: '#FFFFFF',
        hover_background_color: '#B2EBF2',
        hover_text_color: '#004D40',
        disabled_hover_text_color: '#A7BEC6',
        disabled_hover_background_color: '#F0FDFA',
        desktop_background: '#00695C',
        selected_item_color: '#1DE9B6',
        selected_item_text_color: '#ffffff',
        title_bar_gradient_start: '#155e63',
        title_bar_gradient_end: '#39C5BB',
        task_bar_start_button_background_color: '#39C5BB',
        task_bar_item_background: this.encodedImages[2].value //TealMesh
      },
      wallpaper: {
        wallpaperType: 'color',
        backgroundColor: '#B2EBF2'
      }
    },
  ];

  private defaultWallpaper: DesktopBackground = {
    wallpaperType: 'color',
    backgroundColor: '#008080',
  };

  private readonly STORAGE_KEY = 'win98-theme';
  private currentThemeSubject: BehaviorSubject<Theme> = new BehaviorSubject<Theme>(this.themes[0]);
  private currentBackgroundSubject: BehaviorSubject<DesktopBackground>;
  currentBackGround$: Observable<DesktopBackground>;

  constructor(
    private stateService: StateService,
    private localStorageService: LocalStorageService,
  ) {
    const savedState = this.stateService.loadState();
    if (savedState?.wallpaperSettings) {
      this.currentBackgroundSubject =
        new BehaviorSubject<DesktopBackground>({
          wallpaperType: savedState.wallpaperSettings.wallpaperType,
          wallpaperUrl: savedState.wallpaperSettings.wallpaperUrl,
          wallpaperPosition: savedState.wallpaperSettings.wallpaperPosition,
          backgroundColor: savedState.wallpaperSettings.backgroundColor,
        });
    } else {
      this.currentBackgroundSubject =
        new BehaviorSubject<DesktopBackground>({
          wallpaperType: 'none',
          wallpaperUrl: undefined,
          wallpaperPosition: undefined,
          backgroundColor: undefined,
        });
    }
    this.currentBackGround$ = this.currentBackgroundSubject.asObservable();
    this.loadStoredTheme();
  }

  currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  getAvailableThemes(): Observable<Theme[]> {
    return of(this.themes);
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find((t) => t.id === themeId);
    if (theme) {
      this.currentThemeSubject.next(theme);
    }
  }

  applyTheme(theme: Theme): Observable<void> {
    // Apply theme to CSS variables
    this.applyThemeToCSS(theme);
    this.setDesktopBackground(theme.wallpaper ?? this.defaultWallpaper);

    // Update the current theme subject
    this.currentThemeSubject.next(theme);

    // Store theme in localStorage
    this.storeTheme(theme);

    return of(void 0);
  }

  saveTheme(theme: Theme): Observable<void> {
    // Save theme to storage
    this.storeTheme(theme);

    return of(void 0);
  }

  setDesktopBackground(background: DesktopBackground): void {
    this.currentBackgroundSubject.next(background);
    this.stateService.saveCustomizationSettings(background)
  }

  private applyThemeToCSS(theme: Theme): void {
    const root = document.documentElement;

    // Switch CSS stylesheet based on theme
    this.switchStylesheet(theme.id);

    // Apply new theme variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase or snake_case to kebab-case
      const kebabKey = key
        .replace(/_/g, '-')  // Replace underscores with hyphens
        .replace(/([A-Z])/g, '-$1')  // Replace capital letters with hyphen + lowercase
        .toLowerCase()
        .replace(/^-/, '');  // Remove leading hyphen if any

      const cssVar = `--theme-${kebabKey}`;
      console.log(`Setting ${cssVar} = ${value}`); // Debug log
      root.style.setProperty(cssVar, value);
    });

    root.style.setProperty(
      "--theme-task-bar-item-background",
      `url(${theme.colors.task_bar_item_background})`
    );

    // Apply wallpaper
    if (theme.wallpaper) {
      const wallpaperVar = `--theme-wallpaper`;
      root.style.setProperty(wallpaperVar, this.getWallpaperCSS(theme.wallpaper));
    }

    // Force a reflow to ensure styles are applied
    void document.documentElement.offsetHeight;
  }

  private switchStylesheet(themeId: string): void {
    // Determine which stylesheet to load based on theme ID
    const stylesheetMap: { [key: string]: string } = {
      'windows98-Pink': '/assets/styles/98-pink.css',
      'windows98-default': '/assets/styles/98.css'
    };

    let stylesheetPath = stylesheetMap[themeId];
    if (!stylesheetPath) {
      console.warn(`No stylesheet mapping found for theme: ${themeId} default used instead`);
      stylesheetPath = stylesheetMap['windows98-default']; //Use Default Css File
    }

    // Remove all existing theme stylesheets
    const existingLinks = document.querySelectorAll('link[data-theme-stylesheet]');
    existingLinks.forEach(link => link.remove());

    // Create new link element
    const themeLink = document.createElement('link');
    themeLink.id = 'theme-stylesheet';
    themeLink.rel = 'stylesheet';
    themeLink.setAttribute('data-theme-stylesheet', 'true');
    themeLink.href = stylesheetPath;
    document.head.appendChild(themeLink);

    console.log(`Switched stylesheet to: ${stylesheetPath}`);
  }

  private getWallpaperCSS(wallpaper: Theme['wallpaper']): string {
    if (!wallpaper) return 'none';

    switch (wallpaper.wallpaperType) {
      case 'color':
        return wallpaper.backgroundColor ? wallpaper.backgroundColor : 'transparent';
      case 'image':
        return `url(${wallpaper.wallpaperUrl}) ${wallpaper.wallpaperPosition}`;
      default:
        return 'none';
    }
  }

  private storeTheme(theme: Theme): void {
    try {
      this.localStorageService.set(this.STORAGE_KEY, theme);
    } catch (error) {
      console.error('Failed to store theme:', error);
    }
  }

  private loadStoredTheme(): void {
    try {
      const theme = this.localStorageService.get<Theme>(this.STORAGE_KEY);
      if (theme) {
        this.applyThemeToCSS(theme);
      }
    } catch (error) {
      console.error('Failed to load stored theme:', error);
    }
  }
}
