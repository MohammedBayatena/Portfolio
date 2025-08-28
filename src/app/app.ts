import {
  AfterViewInit, Component,
  DOCUMENT,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import {DesktopIcon} from './models/desktop-icon.model';
import {Window} from './models/window.model';
import {ThemeService} from './services/theme.service';
import {WindowService} from './services/window.service';
import {StateService} from './services/state.service';
import {FileExplorerComponent} from './components/file-explorer/file-explorer.component';
import {JsExecutorComponent} from './components/js-executor/js-executor.component';
import {DesktopIconComponent} from './components/desktop-icon/desktop-icon.component';
import {WindowComponent} from './components/window/window.component';
import {TaskbarComponent} from './components/taskbar/taskbar.component';
import {CommonModule} from '@angular/common';
import {Win98MediaPlayerComponent} from './components/win98-media-player/win98-media-player.component';
import {Win98PdfViewerComponent} from './components/win98-pdf-viewer.component/win98-pdf-viewer.component';
import {Win98ImageViewerComponent} from './components/win98-image-viewer.component/win98-image-viewer.component';
import {MediaFileService} from './services/media-file.service';
import {MediaFile} from './models/media-file.model';
import {DesktopBackground} from './models/desktop-background.model';
import {Win98BrowserComponent} from './components/win98-browser.component/win98-browser.component';
import {Win98ScreenSaverComponent} from './components/win98-screen-saver.component/win98-screen-saver.component';
import {Win98NotepadComponent} from './components/win98-notepad.component/win98-notepad.component';
import {Dialog} from './models/dialog.model';
import {DialogService} from './services/dialog.service';
import {DialogWrapper} from './components/dialog-wrapper-component/dialog-wrapper-component';
import {Win98PaintComponent} from './components/win98-paint.component/win98-paint.component';
import {Win98BasicDialogComponent} from './components/win98-basic-dialog.component/win98-basic-dialog.component';
import {ClippyComponent} from './components/clippy.component/clippy.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [
    DesktopIconComponent,
    WindowComponent,
    TaskbarComponent,
    CommonModule,
    Win98ScreenSaverComponent,
    DialogWrapper,
    Win98BasicDialogComponent,
    ClippyComponent
  ],
})
export class App implements OnInit, AfterViewInit {
  @ViewChild('desktop') imageContainer!: ElementRef<HTMLDivElement>;

  protected readonly title = signal('windows-desktop-portfolio');
  private readonly document = inject(DOCUMENT)?.defaultView?.document;

  desktopIcons: DesktopIcon[] = [];
  selectedIconId: string | null = null;
  contextMenuVisible = false;
  contextMenuX = 0;
  contextMenuY = 0;
  currentTheme: any;
  windows: Window[] = [];
  dialogs: Dialog[] = [];
  folderIdCounter = 1000;
  mediaFiles: MediaFile[] = [];
  imageFiles: string[] = [];

  constructor(
    private themeService: ThemeService,
    private windowService: WindowService,
    private dialogService: DialogService,
    private stateService: StateService,
    private mediaService: MediaFileService,
  ) {
  }

  ngOnInit(): void {
    // Load saved state if available
    const savedState = this.stateService.loadState();
    this.mediaService.getMediaFiles().subscribe((files) => {
      this.mediaFiles = files.filter(
        (file) => file.type === 'audio' || file.type === 'video'
      );
      this.imageFiles = files
        .filter((file) => file.type === 'image')
        .map((file) => file.url);
    });

    if (savedState) {
      // Restore desktop icons
      this.desktopIcons = savedState.desktopIcons;
      // Restore windows (simplified - in a real app, we'd need to restore content components too)
      // For now, we'll just start with no windows
    } else {
      // Initialize with default icons
      this.desktopIcons = this.stateService.getDesktopIcons();
    }

    // Set up icon actions
    this.setupIconActions();

    // Subscribe to theme changes
    this.themeService.currentTheme$.subscribe((theme) => {
      this.currentTheme = theme;
      this.applyTheme(theme, this.document);
    });

    // Subscribe to window changes
    this.windowService.components$.subscribe((windows) => {
      this.windows = windows;
      // Save state whenever windows change
      this.stateService.saveState(windows);
    });

    this.dialogService.components$.subscribe(dialogs => {
      this.dialogs = dialogs;
    })

  }

  ngAfterViewInit(): void {
    //Subscribe to desktop background changes
    this.themeService.currentBackGround$.subscribe((background) => {
      this.onBackgroundChange(background);
    });
  }

  private setupIconActions(): void {
    // My Computer
    const myComputerIcon = this.desktopIcons.find(
      (icon) => icon.id === 'my-computer'
    );
    if (myComputerIcon) {
      myComputerIcon.action = () => {
        this.windowService.open({
          id: 'file-explorer',
          title: 'My Computer',
          contentComponent: FileExplorerComponent,
          contentInputs: {
            folderId: 'root',
            windowClose: () => this.windowService.close('file-explorer')
          },
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    // JS Executor
    const jsExecutorIcon = this.desktopIcons.find(
      (icon) => icon.id === 'js-executor'
    );
    if (jsExecutorIcon) {
      jsExecutorIcon.action = () => {
        this.windowService.open({
          id: 'js-executor',
          title: 'JavaScript Executor',
          contentComponent: JsExecutorComponent,
          contentInputs: {title: 'JavaScript Executor'},
          x: 150,
          y: 150,
          width: 700,
          height: 500,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    // Media Player
    const mediaPlayerIcon = this.desktopIcons.find(
      (icon) => icon.id === 'media-player'
    );
    if (mediaPlayerIcon) {
      mediaPlayerIcon.action = () => {
        this.windowService.open({
          id: 'media-player.exe',
          title: 'Media Player',
          contentComponent: Win98MediaPlayerComponent,
          contentInputs: {playlist: this.mediaFiles},
          x: 150,
          y: 150,
          width: 700,
          height: 500,
          minimized: false,
          addMinimizeAsInput: true,
          zIndex: 100,
        });
      };
    }

    // Image Viewer
    const galleryIcon = this.desktopIcons.find(
      (icon) => icon.id === 'image-viewer'
    );
    if (galleryIcon) {
      galleryIcon.action = () => {
        this.windowService.open({
          id: 'image-viewer',
          title: 'Image Viewer',
          contentComponent: Win98ImageViewerComponent,
          contentInputs: {
            images: this.imageFiles,
            initialIndex: 0,
            windowClose: () => this.windowService.close('image-viewer')
          },
          x: 200,
          y: 200,
          width: 800,
          height: 500,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    //CV Viewer
    const cvIcon = this.desktopIcons.find((icon) => icon.id === 'my-cv');
    if (cvIcon) {
      cvIcon.action = () => {
        this.windowService.open({
          id: 'my-cv',
          title: 'PDF Viewer - My CV',
          contentComponent: Win98PdfViewerComponent,
          contentInputs: {
            pdfSrc: 'assets/documents/MohammedBayatenaBackEndCV2025.pdf',
            windowClose: () => this.windowService.close('my-cv')
          },
          x: 250,
          y: 250,
          width: 700,
          height: 500,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    // Recycle Bin
    const recycleBin = this.desktopIcons.find(
      (icon) => icon.id === 'recycle-bin'
    );
    if (recycleBin) {
      recycleBin.action = () => {
        this.windowService.open({
          id: 'file-explorer1',
          title: 'Recycle Bin',
          contentComponent: FileExplorerComponent,
          contentInputs: {folderId: 'recycle-bin'},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }


    // Internet Explorer
    const internetExplorer = this.desktopIcons.find(
      (icon) => icon.id === 'internet-explorer'
    );
    if (internetExplorer) {
      internetExplorer.action = () => {
        this.windowService.open({
          id: 'internet-explorer',
          title: 'Internet Explorer',
          contentComponent: Win98BrowserComponent,
          contentInputs: {windowClose: () => this.windowService.close('internet-explorer')},
          x: 100,
          y: 100,
          width: 1280,
          height: 720,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    // Note Pad
    const notepad = this.desktopIcons.find(
      (icon) => icon.id === 'note-pad'
    );
    if (notepad) {
      notepad.action = () => {
        this.windowService.open({
          id: 'notepad',
          title: 'Notepad',
          contentComponent: Win98NotepadComponent,
          contentInputs: {windowClose: () => this.windowService.close('notepad')},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }

    //Paint
    const paint = this.desktopIcons.find(
      (icon) => icon.id === 'paint'
    );
    if (paint) {
      paint.action = () => {
        this.windowService.open({
          id: 'paint',
          title: 'Paint',
          contentComponent: Win98PaintComponent,
          contentInputs: {windowClose: () => this.windowService.close('paint')},
          x: 100,
          y: 100,
          width: 800,
          height: 600,
          minimized: false,
          addMinimizeAsInput: false,
          zIndex: 100,
        });
      };
    }
  }

  private applyTheme(theme: any, document: any): void {
    document.documentElement.style.setProperty(
      '--desktop-background',
      theme.desktopBackground
    );
    document.documentElement.style.setProperty(
      '--icon-size',
      theme.iconStyle.size
    );
    document.documentElement.style.setProperty(
      '--icon-font',
      theme.iconStyle.font
    );
    document.documentElement.style.setProperty(
      '--icon-color',
      theme.iconStyle.color
    );
    document.documentElement.style.setProperty(
      '--icon-selected-color',
      theme.iconStyle.selectedColor
    );
    document.documentElement.style.setProperty(
      '--icon-background',
      theme.iconStyle.backgroundColor
    );
    document.documentElement.style.setProperty(
      '--icon-selected-background',
      theme.iconStyle.selectedBackgroundColor
    );

    document.documentElement.style.setProperty(
      '--window-border',
      theme.windowStyle.border
    );
    document.documentElement.style.setProperty(
      '--window-border-radius',
      theme.windowStyle.borderRadius
    );
    document.documentElement.style.setProperty(
      '--titlebar-height',
      theme.windowStyle.titleBar.height
    );
    document.documentElement.style.setProperty(
      '--titlebar-background',
      theme.windowStyle.titleBar.background
    );
    document.documentElement.style.setProperty(
      '--titlebar-color',
      theme.windowStyle.titleBar.color
    );
    document.documentElement.style.setProperty(
      '--titlebar-font-weight',
      theme.windowStyle.titleBar.fontWeight
    );
    document.documentElement.style.setProperty(
      '--close-button-background',
      theme.windowStyle.closeButton.background
    );
    document.documentElement.style.setProperty(
      '--close-button-color',
      theme.windowStyle.closeButton.color
    );
    document.documentElement.style.setProperty(
      '--minimize-button-background',
      theme.windowStyle.minimizeButton.background
    );
    document.documentElement.style.setProperty(
      '--minimize-button-color',
      theme.windowStyle.minimizeButton.color
    );

    document.documentElement.style.setProperty(
      '--taskbar-height',
      theme.taskbarStyle.height
    );
    document.documentElement.style.setProperty(
      '--taskbar-background',
      theme.taskbarStyle.background
    );
    document.documentElement.style.setProperty(
      '--taskbar-button-background',
      theme.taskbarStyle.buttonStyle.background
    );
    document.documentElement.style.setProperty(
      '--taskbar-button-color',
      theme.taskbarStyle.buttonStyle.color
    );
    document.documentElement.style.setProperty(
      '--taskbar-button-selected-background',
      theme.taskbarStyle.buttonStyle.selectedBackground
    );
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.selectedIconId = null;
  }

  onDesktopClick(event: MouseEvent): void {
    // Only deselect if clicking directly on desktop, not on an icon
    if (event.target === event.currentTarget) {
      this.selectedIconId = null;
    }
  }

  onDesktopRightClick(event: MouseEvent): void {
    event.preventDefault();
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.contextMenuVisible = true;
  }

  onIconClick(icon: DesktopIcon): void {
    this.selectedIconId = icon.id;
  }

  onIconDoubleClick(icon: DesktopIcon): void {
    if (icon.action) {
      icon.action();
    }
  }

  onIconRightClick(event: { icon: DesktopIcon; event: MouseEvent }): void {
    event.event.preventDefault();
    event.event.stopPropagation();
    this.selectedIconId = event.icon.id;
    // For now, we'll just show the desktop context menu
    // In a real OS, you might have different context menus for different icons
    this.contextMenuX = event.event.clientX;
    this.contextMenuY = event.event.clientY;
    this.contextMenuVisible = true;
  }

  onCreateNewFolder(): void {
    const newFolderId = `folder-${this.folderIdCounter++}`;
    const newFolder: DesktopIcon = {
      id: newFolderId,
      title: 'New Folder',
      icon: '📁',
      x: 50 + (this.desktopIcons.length % 10) * 80,
      y: 150 + Math.floor(this.desktopIcons.length / 10) * 80,
      action: () => {
        // Action for new folder - could open a file explorer at that folder
        console.log(`Opening folder: ${newFolderId}`);
      },
    };

    this.desktopIcons.push(newFolder);
    this.stateService.addDesktopIcon(newFolder);
  }

  onBackgroundChange(background: DesktopBackground) {
    if (background.wallpaperType === 'image' && background.wallpaperUrl) {
      this.imageContainer.nativeElement.style.backgroundImage = `url(${background.wallpaperUrl})`;

      if (background.wallpaperPosition === 'stretch') {
        this.imageContainer.nativeElement.style.backgroundSize = 'cover';
      } else {
        this.imageContainer.nativeElement.style.backgroundRepeat = 'repeat';
      }
    } else {
      this.imageContainer.nativeElement.style.backgroundImage = '';
      this.imageContainer.nativeElement.style.backgroundColor =
        background.backgroundColor || '--desktop-background';
    }
  }

  onChangeTheme(): void {
    const themes = this.themeService.getThemes();
    const currentIndex = themes.findIndex(
      (theme) => theme.id === this.currentTheme.id
    );
    const nextIndex = (currentIndex + 1) % themes.length;
    this.themeService.setTheme(themes[nextIndex].id);
  }

  onScreenSaverActivated() {
  }

  onScreenSaverDeactivated() {
  }
}
