import {Component, HostListener, Input} from '@angular/core';
import {Window} from '../../models/window.model';
import {WindowService} from '../../services/window.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {StartMenu} from '../../models/start-menu.model';
import {StartMenuService} from '../../services/start-menu.service';
import {StartMenuItemComponent} from '../start-menu-item/start-menu-item.component';
import {StartMenuItem} from '../../models/start-menu-item.model';
import {FileExplorerComponent} from '../file-explorer/file-explorer.component';
import {Win98SettingsComponent} from '../win98-settings.component/win98-settings.component';
import {Win98SearchComponent} from '../win98-search.component/win98-search.component';
import {Win98HelpComponent} from '../win98-help.component/win98-help.component';

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.scss'],
  imports: [CommonModule, StartMenuItemComponent, NgOptimizedImage],
})
export class TaskbarComponent {
  @Input() windows: Window[] = [];
  @Input() theme: any;

  public currentTime: string = '';
  public startMenu: StartMenu = {
    visible: false,
    x: 35,
    y: 40,
    width: 10,
    height: 40,
  };
  public startMenuItems: StartMenuItem[] = [
    {
      id: 'my-computer',
      title: 'My Computer',
      iconUrl: '/assets/icons/startMenu/computer_explorer-5.png',
      action: () => {
        this.windowService.open({
          id: 'file-explorer',
          title: 'My Computer',
          contentComponent: FileExplorerComponent,
          contentInputs: {folderId: 'root'},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      },
    },
    {
      id: 'settings',
      title: 'Settings',
      iconUrl: '/assets/icons/startMenu/computer-5.png',
      action: () => {
        this.windowService.open({
          id: 'settings',
          title: 'Settings',
          contentComponent: Win98SettingsComponent,
          contentInputs: {windowClose: () => this.windowService.close('settings')},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      },
    },
    {
      id: 'find',
      title: 'Find',
      iconUrl: '/assets/icons/startMenu/search_file-0.png',
      action: () => {
        this.windowService.open({
          id: 'search',
          title: 'Search',
          contentComponent: Win98SearchComponent,
          contentInputs: {windowClose: () => this.windowService.close('search')},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      },
    },
    {
      id: 'help',
      title: 'Help',
      iconUrl: '/assets/icons/startMenu/help_question_mark.png',
      action: () => {
        this.windowService.open({
          id: 'help',
          title: 'Help',
          contentComponent: Win98HelpComponent,
          // contentInputs: {windowClose: () => this.windowService.close('search')},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      },
    },
    {
      id: 'shutdown',
      title: 'Shut Down',
      iconUrl: '/assets/icons/startMenu/shut_down_normal-0.png',
      action: () => {
        // Implement shutdown logic here
      },
    },
  ];

  constructor(
    private windowService: WindowService,
    private startMenuService: StartMenuService,
  ) {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  onWindowClick(window: Window): void {
    if (window.minimized) {
      this.windowService.restoreWindow(window.id);
    } else {
      this.windowService.bringToFront(window.id);
    }
  }

  onStartMenuItemClick(item: StartMenuItem): void {
    if (item.action) {
      item.action();
    }
  }

  onStartButtonClick(): void {
    if (!this.startMenu.visible) {
      this.startMenuService.openMenu(this.startMenu);
    } else {
      this.startMenuService.closeMenu(this.startMenu);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close start menu when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.start-button')) {
      this.startMenuService.closeMenu(this.startMenu);
    }
  }

  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
