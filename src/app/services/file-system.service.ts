import {inject, Injectable} from '@angular/core';
import {FileSystemItem} from '../models/file-system-item.model';
import {WindowService} from './window.service';
import {Win98PdfViewerComponent} from '../components/win98-pdf-viewer.component/win98-pdf-viewer.component';
import {FilecontentService} from './file-content.service';
import {Win98ImageViewerComponent} from '../components/win98-image-viewer.component/win98-image-viewer.component';
import {Win98MediaPlayerComponent} from '../components/win98-media-player/win98-media-player.component';
import {FileSystemBST} from '../utils/search-tree-helper';
import {Win98GameEmulatorComponent} from '../components/win98-game-emulator.component/win98-game-emulator.component';

@Injectable({
  providedIn: 'root',
})
export class FileSystemService {
  windowService = inject(WindowService);
  contentService = inject(FilecontentService);

  //Create Recycle Bin System
  private recycleBinSystem: FileSystemItem[] = [{
    id: 'deletedFile1',
    type: FileSystemItemType.File,
    name: '.trash.8-23-1998-copy.bin',
    icon: '📄',
    iconUrl: '/assets/icons/files/file.png'
  }];
  //Create Entire Computer File System
  private fileSystem: FileSystemItem[] = [
    {
      id: "flobbyDriveA",
      name: "3½ Floppy (A:)",
      type: FileSystemItemType.Drive,
      icon: '💾',
      iconUrl: '/assets/icons/others/floppy_drive.png',
      freeSpace: 1.38,
      size: 1.44,
      spaceUnit: SizeUnit.MB,
      children: []
    },
    {
      id: "localDiskC",
      name: "Local Disk (C:)",
      type: FileSystemItemType.Drive,
      icon: '💿',
      iconUrl: '/assets/icons/others/hard_disk_drive-32.png',
      freeSpace: 3.2,
      size: 10,
      spaceUnit: SizeUnit.GB,
      children: [
        {
          id: 'Documents and Settings',
          name: 'Documents and Settings',
          type: FileSystemItemType.Folder,
          icon: '📁',
          iconUrl: '/assets/icons/files/folder.png',
          children: [
            {
              id: 'documents',
              name: 'Documents',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
              children: [
                {
                  id: 'resume',
                  name: 'Resume.pdf',
                  type: FileSystemItemType.File,
                  icon: '📄',
                  iconUrl: '/assets/icons/files/document.png',
                  content: 'This is my resume content.',
                  action: () => {
                    this.windowService.open({
                      id: 'my-cv',
                      title: 'PDF Viewer - My CV',
                      contentComponent: Win98PdfViewerComponent,
                      contentInputs: {
                        pdfSrc: '/assets/documents/MohammedBayatenaBackEndCV2025.pdf',
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
                  },
                },
                {
                  id: 'cover-letter',
                  name: 'Cover Letter.docx',
                  type: FileSystemItemType.File,
                  icon: '📄',
                  iconUrl: '/assets/icons/files/docx.png',
                  content:
                    this.contentService.getFileContent('coverLetter') ??
                    'This is my cover letter content.',
                },
              ],
            },
            {
              id: 'pictures',
              name: 'Pictures',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
              children: [
                {
                  id: 'miku',
                  name: 'HatsuneMiku.jpg',
                  type: FileSystemItemType.File,
                  icon: '🖼️',
                  iconUrl: '/assets/icons/files/imageico.png',
                  action: () => {
                    this.windowService.open({
                      id: 'image-viewer-1',
                      title: 'Image Viewer',
                      contentComponent: Win98ImageViewerComponent,
                      contentInputs: {
                        images: ['/assets/images/miku.png'],
                        initialIndex: 0,
                        windowClose: () => this.windowService.close('image-viewer-1')
                      },
                      x: 200,
                      y: 200,
                      width: 800,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: false,
                      zIndex: 100,
                    });
                  },
                },
                {
                  id: 'idk',
                  name: 'SomeImage.png',
                  type: FileSystemItemType.File,
                  icon: '🖼️',
                  iconUrl: '/assets/icons/files/imageico.png',
                  action: () => {
                    this.windowService.open({
                      id: 'image-viewer-2',
                      title: 'Image Viewer',
                      contentComponent: Win98ImageViewerComponent,
                      contentInputs: {
                        images: ['/assets/images/huh.jpg'],
                        initialIndex: 0,
                        windowClose: () => this.windowService.close('image-viewer-2')
                      },
                      x: 200,
                      y: 200,
                      width: 800,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: false,
                      zIndex: 100,
                    });
                  },
                },
              ],
            },
            {
              id: 'projects',
              name: 'Projects',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
              children: [
                {
                  id: 'project1',
                  name: 'Project 1',
                  type: FileSystemItemType.Folder,
                  icon: '📁',
                  iconUrl: '/assets/icons/files/folder.png',
                  children: [
                    {
                      id: 'readme',
                      name: 'README.md',
                      type: FileSystemItemType.File,
                      icon: '📄',
                      iconUrl: '/assets/icons/files/file.png',
                      content: '# Project 1\n\nThis is project 1.',
                    },
                  ],
                },
                {
                  id: 'project2',
                  name: 'Project 2',
                  type: FileSystemItemType.Folder,
                  icon: '📁',
                  iconUrl: '/assets/icons/files/folder.png',
                },
              ],
            },
            {
              id: 'music',
              name: 'Music',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
              children: [
                {
                  id: 'song1',
                  name: 'BubbleGum.m4a',
                  type: FileSystemItemType.File,
                  icon: '🎵',
                  action: () => {
                    this.windowService.open({
                      id: 'media-player1',
                      title: 'Media Player',
                      contentComponent: Win98MediaPlayerComponent,
                      contentInputs: {
                        playlist: [
                          {
                            name: 'BubbleGum.m4a',
                            url: '/assets/audio/bubblegum.m4a',
                            type: 'audio',
                          },
                        ],
                      },
                      x: 150,
                      y: 150,
                      width: 700,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: true,
                      zIndex: 100,
                    });
                  },
                  iconUrl: '/assets/icons/files/sound.png',
                },
                {
                  id: 'song2',
                  name: 'Nuclear - Mike Oldfield.mp3',
                  type: FileSystemItemType.File,
                  icon: '🎵',
                  action: () => {
                    this.windowService.open({
                      id: 'media-player2',
                      title: 'Media Player',
                      contentComponent: Win98MediaPlayerComponent,
                      contentInputs: {
                        playlist: [
                          {
                            name: 'Nuclear - Mike Oldfield.mp3',
                            url: '/assets/audio/nuclear.mp3',
                            type: 'audio',
                          },
                        ],
                      },
                      x: 150,
                      y: 150,
                      width: 700,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: true,
                      zIndex: 100,
                    });
                  },
                  iconUrl: '/assets/icons/files/sound.png',
                },
              ],
            },
            {
              id: 'videos',
              name: 'Videos',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
              children: [
                {
                  id: 'video1',
                  name: 'Democracy.mp4',
                  type: FileSystemItemType.File,
                  icon: '🎬',
                  action: () => {
                    this.windowService.open({
                      id: 'media-player3',
                      title: 'Media Player - Democracy.mp4',
                      contentComponent: Win98MediaPlayerComponent,
                      contentInputs: {
                        playlist: [
                          {
                            name: 'Democracy.mp4',
                            url: '/assets/videos/democracy.mp4',
                            type: 'video',
                          },
                        ],
                      },
                      x: 150,
                      y: 150,
                      width: 700,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: true,
                      zIndex: 100,
                    });
                  },
                  iconUrl: '/assets/icons/files/media_player_file.png',
                },
                {
                  id: 'video2',
                  name: 'Lain.mp4',
                  type: FileSystemItemType.File,
                  icon: '🎬',
                  action: () => {
                    this.windowService.open({
                      id: 'media-player4',
                      title: 'Media Player - Lain.mp4',
                      contentComponent: Win98MediaPlayerComponent,
                      contentInputs: {
                        playlist: [
                          {
                            name: 'Lain.mp4',
                            url: '/assets/videos/lain.mp4',
                            type: 'video',
                          },
                        ],
                      },
                      x: 150,
                      y: 150,
                      width: 700,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: true,
                      zIndex: 100,
                    });
                  },
                  iconUrl: '/assets/icons/files/media_player_file.png',
                },
                {
                  id: 'video3',
                  name: 'Iserlohn Fortress.mp4',
                  type: FileSystemItemType.File,
                  icon: '🎬',
                  action: () => {
                    this.windowService.open({
                      id: 'media-player5',
                      title: 'Media Player - Iserlohn Fortress.mp4',
                      contentComponent: Win98MediaPlayerComponent,
                      contentInputs: {
                        playlist: [
                          {
                            name: 'Iserlohn Fortress.mp4',
                            url: '/assets/videos/spacefleet.mp4',
                            type: 'video',
                          },
                        ],
                      },
                      x: 150,
                      y: 150,
                      width: 700,
                      height: 500,
                      minimized: false,
                      addMinimizeAsInput: true,
                      zIndex: 100,
                    });
                  },
                  iconUrl: '/assets/icons/files/media_player_file.png',
                },
              ],
            },]
        },
        {
          id: 'Windows',
          name: 'Windows',
          type: FileSystemItemType.Folder,
          icon: '📁',
          iconUrl: '/assets/icons/files/folder.png',
          children: [
            {
              id: 'System',
              name: 'System',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
            },
            {
              id: 'System32',
              name: 'System32',
              type: FileSystemItemType.Folder,
              icon: '📁',
              iconUrl: '/assets/icons/files/folder.png',
            },
            {
              id: 'notepad.exe',
              name: 'notepad.exe',
              type: FileSystemItemType.File,
              size: 54,
              spaceUnit: SizeUnit.KB,
              icon: '⚙️', //TODO MAKE THIS NOTEPAD
              // iconUrl: '/assets/icons/files/folder.png',
            }
          ]
        },
        {
          id: 'Program Files',
          name: 'Program Files',
          type: FileSystemItemType.Folder,
          icon: '📁',
          iconUrl: '/assets/icons/files/folder.png',
        },
      ]
    },
    {
      id: "cdRomE",
      name: "CD-ROM (E:)",
      type: FileSystemItemType.Cdrom,
      icon: '💿',
      iconUrl: '/assets/icons/others/cd_drive.png',
      freeSpace: 650,
      size: 650,
      spaceUnit: SizeUnit.MB,
      children: []
    },
    {
      id: "cdRomE2",
      name: "Games (F:)",
      type: FileSystemItemType.Cdrom,
      icon: '💿',
      iconUrl: '/assets/icons/others/sega_cd.png',
      freeSpace: 210,
      size: 700,
      spaceUnit: SizeUnit.MB,
      children: [
        {
          id: 'tekken-3',
          name: 'Tekken 3.exe',
          type: FileSystemItemType.File,
          icon: '🎮',
          iconUrl: '/assets/icons/games/tekken3.png',
          action: () => {
            this.windowService.open({
              id: 'gameContainer',
              title: 'Tekken 3',
              contentComponent: Win98GameEmulatorComponent,
              contentInputs: {
                gameTitle: 'Tekken 3',
                gameURL: 'https://www.retrogames.cc/embed/40238-tekken-3.html'
              },
              x: 150,
              y: 150,
              width: 800,
              height: 600,
              minimized: false,
              addMinimizeAsInput: false,
              zIndex: 100,
            });
          },
        },
        {
          id: 'crash-bandicoot',
          name: 'Crash Bandicoot.exe',
          type: FileSystemItemType.File,
          icon: '🎮',
          iconUrl: '/assets/icons/games/bandi.png',
          action: () => {
            this.windowService.open({
              id: 'gameContainer',
              title: 'Crash Bandicoot',
              contentComponent: Win98GameEmulatorComponent,
              contentInputs: {
                gameTitle: 'Crash Bandicoot',
                gameURL: 'https://www.retrogames.cc/embed/40784-crash-bandicoot.html'
              },
              x: 150,
              y: 150,
              width: 800,
              height: 600,
              minimized: false,
              addMinimizeAsInput: false,
              zIndex: 100,
            });
          },
        },
        {
          id: 'sonic-classic',
          name: 'Sonic Classic Heroes.exe',
          type: FileSystemItemType.File,
          icon: '🎮',
          iconUrl: '/assets/icons/games/sonic.png',
          action: () => {
            this.windowService.open({
              id: 'gameContainer',
              title: 'Sonic Classic Heroes ',
              contentComponent: Win98GameEmulatorComponent,
              contentInputs: {
                gameTitle: 'Sonic Classic Heroes',
                gameURL: 'https://www.retrogames.cc/embed/42046-sonic-classic-heroes.html'
              },
              x: 150,
              y: 150,
              width: 800,
              height: 600,
              minimized: false,
              addMinimizeAsInput: false,
              zIndex: 100,
            });
          },
        },
        {
          id: 'street-fighter',
          name: 'Street Fighter II.exe',
          type: FileSystemItemType.File,
          icon: '🎮',
          iconUrl: '/assets/icons/games/street-fighter.png',
          action: () => {
            this.windowService.open({
              id: 'gameContainer',
              title: 'Street Fighter II',
              contentComponent: Win98GameEmulatorComponent,
              contentInputs: {
                gameTitle: 'Street Fighter II',
                gameURL: 'https://www.retrogames.cc/embed/10030-street-fighter-ii-champion-edition-street-fighter-2-920513-etc.html'
              },
              x: 150,
              y: 150,
              width: 800,
              height: 600,
              minimized: false,
              addMinimizeAsInput: false,
              zIndex: 100,
            });
          },
        },
      ]
    },
  ];

  private fileSystemBST = new FileSystemBST();

  //Create a dynamic dictionary (Index) of every file in the file system and recycle-bin
  private fileTypeByIdMap: Map<string, FileSystemItemMetaData> = new Map([
    [
      'root',
      {
        id: 'root',
        type: FileSystemItemType.Folder,
        name: 'My Computer',
        childrenCount: this.fileSystem.length
      }
    ],
    [
      'recycle-bin',
      {
        id: 'recycle-bin',
        type: FileSystemItemType.Folder,
        name: 'Recycle Bin',
        childrenCount: this.recycleBinSystem.length
      }
    ]
  ]);

  private navigationSideBarItems: SideBarNavigationLink[] = []

  constructor() {
    this.buildFilesMetaDataMap()
    this.buildNavigationTree()
    console.log(this.navigationSideBarItems)
    this.buildBSTFromFileSystem()
  }

  private buildFilesMetaDataMap() {
    const visitItem = (items: FileSystemItem[]) => {
      items.forEach(item => {
        this.fileTypeByIdMap.set(item.id, {
          id: item.id,
          type: item.type,
          name: item.name,
          size: item.size,
          childrenCount: item.children?.length,
          freeSpace: item.freeSpace,
          spaceUnit: item.spaceUnit
        })
        if (item.children) {
          visitItem(item.children);
        } else {
          return
        }
      });
    }

    visitItem(this.fileSystem);
    visitItem(this.recycleBinSystem)
  }

  private buildNavigationTree() {
    const visitItem = (items: FileSystemItem[] | undefined, level: number, path: BreadCrumbPath[]): SideBarNavigationLink[] => {

      let navItems: SideBarNavigationLink[] = [];
      ++level //Increase Level

      if (!items) {
        return [];
      }

      items.forEach((item: FileSystemItem) => {
        if (item.type !== FileSystemItemType.File) {
          navItems.push({
            name: item.name,
            dstDirectoryId: item.id,
            linkType: NavigationLinkType.Navigation,
            level: level,
            children: visitItem(item.children, level, [...path, {id: item.id, name: item.name}]),
            iconUrl: item.iconUrl ?? "",
            isExpanded: false,
            path: [...path, {id: item.id, name: item.name}]
          })
        }
      })
      return navItems;
    }
    this.navigationSideBarItems = [
      {
        linkType: NavigationLinkType.Navigation,
        dstDirectoryId: 'root',
        name: 'My Computer',
        iconUrl: '/assets/icons/desktop/computer_explorer.png',
        isExpanded: true,
        level: 0,
        children: visitItem(this.fileSystem, 0, [{id: 'root', name: 'My Computer'}]),
        path: [{id: 'root', name: 'My Computer'}]
      },
      {
        linkType: NavigationLinkType.Navigation,
        dstDirectoryId: 'recycle-bin',
        name: 'Recycle Bin',
        iconUrl: '/assets/icons/desktop/recycle_bin_full.png',
        isExpanded: false,
        level: 0,
        children: visitItem(this.recycleBinSystem, 0, [{id: 'recycle-bin', name: 'Recycle Bin'}]),
        path: [{id: 'recycle-bin', name: 'Recycle Bin'}]
      }
    ]
  }

  // Function to build BST from file system array excluding Drives and CdRoms would be ignored
  // only their Children Added
  private buildBSTFromFileSystem() {
    const bst = new FileSystemBST();

    function traverse(items: FileSystemItem[], currentPath: string[] = []) {
      const ignoredTypes = [FileSystemItemType.Drive, FileSystemItemType.Cdrom]
      for (const item of items) {
        const newPath = [...currentPath, item.name];
        if (!(ignoredTypes.includes(item.type))) {
          bst.insert(item, newPath);
        }
        if (item.children && item.children.length > 0) {
          traverse(item.children, newPath);
        }
      }
    }

    traverse(this.fileSystem);
    this.fileSystemBST = bst;
  }

  getFileSystem(): FileSystemItem[] {
    return this.fileSystem;
  }

  getSearchTree(): FileSystemBST {
    return this.fileSystemBST
  }

  getNavigationSideBarItems(): SideBarNavigationLink[] {
    return this.navigationSideBarItems;
  }

  getFolderContents(folderId: string): FileSystemItem[] {
    const findFolder = (
      items: FileSystemItem[],
      id: string
    ): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === id && (item.type === FileSystemItemType.Folder || item.type === 'drive' || item.type === 'cdrom')) {
          return item;
        }
        if (item.children) {
          const found = findFolder(item.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const folder = findFolder(this.fileSystem, folderId);
    return folder?.children || [];
  }

  getRecycleBinContent(): FileSystemItem[] {
    return this.recycleBinSystem
  }

  getFileContent(fileId: string): string | undefined {
    const findFile = (
      items: FileSystemItem[],
      id: string
    ): FileSystemItem | null => {
      for (const item of items) {
        if (item.id === id && item.type === FileSystemItemType.File) {
          return item;
        }
        if (item.children) {
          const found = findFile(item.children, id);
          if (found) {
            return found;
          }
        }
      }
      return null;
    };

    const file = findFile(this.fileSystem, fileId);
    return file?.content;
  }

  getItemMetaData(itemId: string): FileSystemItemMetaData | undefined {
    return this.fileTypeByIdMap.get(itemId);
  }
}

//Exports
export enum FileSystemItemType {
  'Folder' = 'folder',
  'Drive' = 'drive',
  'Cdrom' = 'cdrom',
  'File' = 'file',
}

export enum SizeUnit {
  'B' = 'B',
  'KB' = 'KB',
  'MB' = 'MB',
  'GB' = 'GB'
}

export enum NavigationLinkType {
  'Action' = 'action',
  'Navigation' = 'navigation',
}

export interface FileSystemItemMetaData {
  id: string;
  name: string;
  type: FileSystemItemType;
  freeSpace?: number;
  size?: number,
  spaceUnit?: SizeUnit;
  childrenCount?: number
}

export interface BreadCrumbPath {
  id: string;
  name: string;
}

export interface SideBarNavigationLink {
  linkType: NavigationLinkType
  iconUrl: string
  name: string;
  dstDirectoryId?: string
  action?: () => void,
  isExpanded: boolean,
  level: number,
  children?: SideBarNavigationLink[];
  path: BreadCrumbPath[]
}
