import {Injectable} from '@angular/core';
import {Theme} from '../models/theme.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {DesktopBackground} from '../models/desktop-background.model';
import {StateService} from './state.service';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themes: Theme[] = [
    {
      id: 'windows98',
      name: 'Windows 98',
      desktopBackground: '#008080',
      iconStyle: {
        size: '32px',
        font: 'MS Sans Serif',
        color: '#FFFFFF',
        selectedColor: '#FFFFFF',
        backgroundColor: 'transparent',
        selectedBackgroundColor: '#000080',
      },
      windowStyle: {
        border: '2px solid #C0C0C0',
        borderRadius: '0',
        titleBar: {
          height: '24px',
          background: '#000080',
          gradient: 'linear-gradient(to right, #000080, #1084D0)',
          color: '#FFFFFF',
          fontWeight: 'bold',
        },
        closeButton: {
          background: '#C0C0C0',
          color: '#000000',
        },
        minimizeButton: {
          background: '#C0C0C0',
          color: '#000000',
        },
      },
      taskbarStyle: {
        height: '30px',
        background: '#C0C0C0',
        buttonStyle: {
          background: '#C0C0C0',
          color: '#000000',
          selectedBackground: '#808080',
        },
      },
    },
    {
      id: 'windows7',
      name: 'Windows 7',
      desktopBackground: 'linear-gradient(to bottom, #6CB8E3, #95D3F5)',
      iconStyle: {
        size: '48px',
        font: 'Segoe UI',
        color: '#FFFFFF',
        selectedColor: '#FFFFFF',
        backgroundColor: 'transparent',
        selectedBackgroundColor: 'rgba(0, 120, 215, 0.5)',
      },
      windowStyle: {
        border: '1px solid #0078D7',
        borderRadius: '4px',
        titleBar: {
          height: '30px',
          background: '#0078D7',
          gradient: 'linear-gradient(to right, #0078D7, #4A9FDE)',
          color: '#FFFFFF',
          fontWeight: 'normal',
        },
        closeButton: {
          background: '#E81123',
          color: '#FFFFFF',
        },
        minimizeButton: {
          background: 'transparent',
          color: '#FFFFFF',
        },
      },
      taskbarStyle: {
        height: '40px',
        background: 'linear-gradient(to bottom, #C3C6C9, #8B8E91)',
        buttonStyle: {
          background: 'rgba(255, 255, 255, 0.2)',
          color: '#FFFFFF',
          selectedBackground: 'rgba(255, 255, 255, 0.4)',
        },
      },
    },
    {
      id: 'windows10',
      name: 'Windows 10',
      desktopBackground: 'linear-gradient(to bottom, #3B7EA1, #2C5282)',
      iconStyle: {
        size: '48px',
        font: 'Segoe UI',
        color: '#FFFFFF',
        selectedColor: '#FFFFFF',
        backgroundColor: 'transparent',
        selectedBackgroundColor: 'rgba(0, 120, 215, 0.5)',
      },
      windowStyle: {
        border: '1px solid #0078D7',
        borderRadius: '0',
        titleBar: {
          height: '32px',
          background: '#0078D7',
          color: '#FFFFFF',
          fontWeight: 'normal',
        },
        closeButton: {
          background: '#E81123',
          color: '#FFFFFF',
        },
        minimizeButton: {
          background: 'transparent',
          color: '#FFFFFF',
        },
      },
      taskbarStyle: {
        height: '40px',
        background: 'linear-gradient(to bottom, #2D2D30, #1E1E1E)',
        buttonStyle: {
          background: 'transparent',
          color: '#FFFFFF',
          selectedBackground: 'rgba(255, 255, 255, 0.2)',
        },
      },
    },
  ];

  private currentThemeSubject: BehaviorSubject<Theme> =
    new BehaviorSubject<Theme>(this.themes[0]);
  currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  private currentBackgroundSubject: BehaviorSubject<DesktopBackground>;
  currentBackGround$: Observable<DesktopBackground>;

  constructor(private stateService: StateService) {
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
  }

  getThemes(): Theme[] {
    return this.themes;
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }

  setDesktopBackground(background: DesktopBackground): void {
    this.currentBackgroundSubject.next(background);
    this.stateService.saveCustomizationSettings(background)
  }

  setTheme(themeId: string): void {
    const theme = this.themes.find((t) => t.id === themeId);
    if (theme) {
      this.currentThemeSubject.next(theme);
    }
  }
}
