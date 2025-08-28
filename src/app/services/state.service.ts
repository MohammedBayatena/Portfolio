import {inject, Injectable} from '@angular/core';
import {DesktopIcon} from '../models/desktop-icon.model';
import {Window} from '../models/window.model';
import {LocalStorageService} from '../utils/local-storage.service';
import {ScreenSaverSettings} from '../models/screen-saver-settings.model';
import {DesktopBackground} from '../models/desktop-background.model';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private localStorageService = inject(LocalStorageService);

  private desktopIcons: DesktopIcon[] = [
    {
      id: 'my-computer',
      title: 'My Computer',
      action: () => console.log('Opening My Computer...'),
      icon: '🖥️',
      iconUrl: '/assets/icons/desktop/computer_explorer.png',
      x: 50,
      y: 50,
    },
    {
      id: 'internet-explorer',
      title: 'Internet Explorer',
      action: () => console.log('Opening Recycle Bin...'),
      icon: '🌐',
      iconUrl: '/assets/icons/desktop/IExplorer.png',
      x: 50,
      y: 150,
    },
    {
      id: 'js-executor',
      title: 'JS Executor',
      action: () => console.log('Opening JS Executor...'),
      icon: '💻',
      iconUrl: '/assets/icons/desktop/exe.png',
      x: 50,
      y: 250,
    },
    {
      id: 'media-player',
      title: 'Media Player',
      action: () => console.log('Opening Media Player...'),
      icon: '🎞️',
      iconUrl: '/assets/icons/desktop/media_player.png',
      x: 50,
      y: 350,
    },
    {
      id: 'recycle-bin',
      title: 'Recycle Bin',
      action: () => console.log('Opening Recycle Bin...'),
      icon: '🗑️',
      iconUrl: '/assets/icons/desktop/recycle_bin_full.png',
      x: 50,
      y: 450,
    },
    {
      id: 'image-viewer',
      title: 'Image Viewer',
      action: () => console.log('Opening Image Viewer...'),
      icon: '🏞️',
      iconUrl: '/assets/icons/desktop/gallery.png',
      x: 150,
      y: 50,
    },
    {
      id: 'note-pad',
      title: 'Notepad',
      action: () => console.log('Opening Notepad...'),
      icon: '🗒️',
      iconUrl: '/assets/icons/desktop/notepad.png',
      x: 150,
      y: 150,
    },
    {
      id: 'my-cv',
      title: 'My CV',
      action: () => console.log('Opening CV...'),
      icon: '📄',
      iconUrl: '/assets/icons/files/document.png',
      x: 150,
      y: 250,
    },
    {
      id: 'paint',
      title: 'Paint',
      action: () => console.log('Opening Paint...'),
      icon: '🎨',
      iconUrl: '/assets/icons/desktop/paint.png',
      x: 150,
      y: 350,
    },
  ];

  private state = {};

  constructor() {
    this.state = this.loadState() ?? {};
  }

  getDesktopIcons(): DesktopIcon[] {
    return [...this.desktopIcons];
  }

  addDesktopIcon(icon: DesktopIcon): void {
    this.desktopIcons.push(icon);
  }

  removeDesktopIcon(iconId: string): void {
    this.desktopIcons = this.desktopIcons.filter((icon) => icon.id !== iconId);
  }

  moveDesktopIcon(iconId: string, x: number, y: number): void {
    const icon = this.desktopIcons.find((i) => i.id === iconId);
    if (icon) {
      icon.x = x;
      icon.y = y;
    }
  }

  saveState(windows: Window[]): void {
    // Save state to localStorage
    this.state = {
      ...this.state,
      desktopIcons: this.desktopIcons,
      windows: windows.map((w) => ({
        id: w.id,
        title: w.title,
        x: w.x,
        y: w.y,
        width: w.width,
        height: w.height,
        minimized: w.minimized,
      })),
    };
    this.localStorageService.set('desktopState', this.state);
  }

  saveScreenSaverSettings(screenSaverSettings: ScreenSaverSettings): void {
    this.state = {
      ...this.state,
      screenSaverSettings: screenSaverSettings,
    }
    this.localStorageService.set('desktopState', this.state);
  }

  saveCustomizationSettings(wallpaperSettings: DesktopBackground): void {
    this.state = {
      ...this.state,
      wallpaperSettings: wallpaperSettings,
    }
    this.localStorageService.set('desktopState', this.state);
  }

  loadState(): {
    desktopIcons: DesktopIcon[];
    windows: Window[];
    screenSaverSettings: ScreenSaverSettings,
    wallpaperSettings: DesktopBackground,
  } | null {
    const savedState = this.localStorageService.get<any>('desktopState');
    if (savedState) {
      return savedState;
    }
    return null;
  }
}
