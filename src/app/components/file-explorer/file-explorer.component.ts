import {Component, HostListener, Input, OnInit} from '@angular/core';
import {FileSystemItem} from '../../models/file-system-item.model';
import {
  BreadCrumbPath,
  FileSystemItemMetaData,
  FileSystemItemType,
  FileSystemService,
  NavigationLinkType,
  SideBarNavigationLink, SizeUnit
} from '../../services/file-system.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ContextMenuComponent} from '../context-menu/context-menu.component';
import {ContextMenuModel} from '../../models/context-menu.model';
import {TypeParserService} from '../../utils/type-parser.service';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {NavigationTreeItemComponent} from '../navigation-tree-item.component/navigation-tree-item.component';
import {ToolbarBuilder} from '../../utils/toolbar-builder';
import {DialogService} from '../../services/dialog.service';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.scss'],
  imports: [CommonModule, NgOptimizedImage, ContextMenuComponent, Win98ToolbarComponent, NavigationTreeItemComponent],
})
export class FileExplorerComponent implements OnInit {
  @Input() folderId: string = 'root';
  @Input() windowClose: () => void = () => {
  };

  addressBarIcon = ''
  currentFolderId: string = 'root';
  currentFolderName: string = 'My Computer';
  selectedItemMetaData: FileSystemItemMetaData | undefined
  sideBarNavigationItems: SideBarNavigationLink[] = []
  statusBarData: {
    firstTab: string,
    secondTab: string,
    thirdTab: string
  } = {
    firstTab: '-',
    secondTab: '-',
    thirdTab: '-'
  }
  folderContents: FileSystemItem[] = [];
  fileContent: string | null = null;
  breadcrumb: BreadCrumbPath[] = [];

  private myComputerDirectory: string = 'root'
  private recycleBinDirectory: string = 'recycle-bin'

  //Tool Bar
  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'back', label: 'Back', shortcut: 'Backspace', action: () => this.navigateUp()})
    .AddDivider()
    .AddDropDownItem({
      id: 'close', label: 'Close', shortcut: 'Alt+F4', action: () => this.handleClose()
    })
    .AddDropdown('view', 'View')
    .AddDropDownItem({id: 'large', label: 'Large Icons', shortcut: '', action: () => this.changeViewMode('large')})
    .AddDropDownItem({id: 'small', label: 'Small Icons', shortcut: '', action: () => this.changeViewMode('small')})
    .AddDropDownItem({id: 'list', label: 'List', shortcut: '', action: () => this.changeViewMode('list')})
    .AddDropDownItem({id: 'details', label: 'Details', shortcut: '', action: () => this.changeViewMode('details')})
    .AddDivider()
    .AddDropDownItem({id: 'sortName', label: 'Sort By Name', shortcut: '', action: () => this.sortItems('name')})
    .AddDropDownItem({id: 'sortSize', label: 'Sort By Size', shortcut: '', action: () => this.sortItems('size')})
    .AddDropDownItem({id: 'sortType', label: 'Sort By Type', shortcut: '', action: () => this.sortItems('type')})
    .AddDivider()
    .AddDropDownItem({id: 'refresh', label: 'Refresh', shortcut: 'F5', action: () => this.refresh()})
    .AddDivider()
    .AddDropDownItem({id: 'clear', label: 'Clear Selection', shortcut: '', action: () => this.clear()})
    .AddDropdown('search', 'Search')
    .AddDropDownItem({
      id: 'find', label: 'Find', shortcut: 'Ctrl+F', action: () => {
      }
    })
    .AddDropdown('help', 'Help')
    .AddDropDownItem({
      id: 'aboutFileExplorer', label: 'About File Explorer', action: () => this.handleAboutFileExplorer()
    })
    .GetToolbar()

  //Side Bar
  isFolderTreeVisible: boolean = false;

  // Selected items
  selectedItems: Set<string> = new Set();

  // Context menu
  showContextMenu: boolean = false;
  contextMenuPosition = {x: 0, y: 0};
  contextMenuItem: FileSystemItem | null = null;
  contextMenuModel: ContextMenuModel[] = [
    {
      id: 'view',
      label: 'View',
      children: [
        {
          id: 'large',
          label: 'Large Icons',
          children: [],
          action: () => this.changeViewMode('large'),
        },
        {
          id: 'small',
          label: 'Small Icons',
          children: [],
          action: () => this.changeViewMode('small'),
        },
        {
          id: 'list',
          label: 'List',
          children: [],
          action: () => this.changeViewMode('list'),
        },
        {
          id: 'details',
          label: 'Details',
          children: [],
          action: () => this.changeViewMode('details'),
        }
      ]
    },
    {
      id: 'sortBy',
      label: 'Sort by',
      action: () => {
      },
      children: [
        {
          id: 'name',
          label: 'Name',
          children: [],
          action: () => this.sortItems('name'),
        },
        {
          id: 'size',
          label: 'Size',
          children: [],
          action: () => this.sortItems('size'),
        },
        {
          id: 'type',
          label: 'Type',
          children: [],
          action: () => this.sortItems('type'),
        },

      ]
    },
    {
      id: 'refresh',
      label: 'Refresh',
      action: () => this.refresh(),
      children: []
    },
    {
      id: 'divider1',
      label: 'divider',
      divider: true,
      children: []
    },
    {
      id: 'paste',
      label: 'Paste',
      action: () => {
      },
      children: [],
      disabled: true
    },
    {
      id: 'divider2',
      label: 'divider',
      divider: true,
      children: []
    },
    {
      id: 'properties',
      label: 'Properties',
      action: () => {
      },
      children: []
    }
  ]

  // Sort options
  sortBy: 'name' | 'size' | 'type' | 'modified' = 'name';
  sortOrder: 'asc' | 'desc' = 'asc';

  // View mode
  viewMode: 'large' | 'small' | 'list' | 'details' = 'large';

  constructor(
    private dialogService: DialogService,
    private fileSystemService: FileSystemService) {
  }

  ngOnInit(): void {
    //Load Folder Contents and MetaData
    this.loadFolderContents(this.folderId);
    this.updateSelectedItemMetaData(this.folderId)
    //Load SideBar Navigations
    this.sideBarNavigationItems = this.fileSystemService.getNavigationSideBarItems()
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showContextMenu = false;
  }

  loadFolderContents(folderId: string): void {
    this.currentFolderId = folderId;
    this.updateSelectedItemMetaData(this.currentFolderId)
    this.fileContent = null;
    this.clearSelectedItems();

    if (folderId === this.myComputerDirectory) {
      this.addressBarIcon = 'assets/icons/startMenu/computer_explorer-5.png'
      this.currentFolderName = 'My Computer';
      this.isFolderTreeVisible = true;
      this.folderContents = this.fileSystemService.getFileSystem();
      this.breadcrumb = [{id: 'root', name: 'My Computer'}];
    } else if (folderId === this.recycleBinDirectory) {
      this.addressBarIcon = 'assets/icons/desktop/recycle_bin_full.png'
      this.currentFolderName = 'Recycle Bin';
      this.folderContents = this.fileSystemService.getRecycleBinContent();
      this.breadcrumb = [{id: 'recycle-bin', name: 'Recycle Bin'}];
    } else {
      //Load Selected Item Content
      this.folderContents = this.fileSystemService.getFolderContents(folderId);
      this.addressBarIcon = 'assets/icons/startMenu/computer_explorer-5.png'
      // Update breadcrumb
      this.updateBreadcrumbPath(folderId);
    }
  }

  updateSelectedItemMetaData(itemId: string): void {
    let metaData = this.fileSystemService.getItemMetaData(itemId);
    this.selectedItemMetaData = metaData;
    this.updateStatusBarData(metaData?.type ?? 'none')
  }

  buildPieChartStyleOrDefault(metaData: FileSystemItemMetaData | undefined): string {
    if (metaData) {
      if (metaData.freeSpace && metaData.size) {
        let usage = metaData.freeSpace * 100 / metaData.size;
        return `conic-gradient(#666 ${usage}%, #8d0f82 ${usage}%)`
      }
      return '';
    }
    return '';
  }

  open(item: FileSystemItem) {
    if (item.type === FileSystemItemType.Folder || item.type === FileSystemItemType.Drive || item.type === FileSystemItemType.Cdrom) {
      this.openFolder(item);
    } else {
      this.openFile(item)
    }
  }

  private openFolder(folder: FileSystemItem): void {
    this.loadFolderContents(folder.id);
  }

  private openFile(file: FileSystemItem): void {
    if (file.action) {
      file.action();
    } else {
      const content = this.fileSystemService.getFileContent(file.id);
      this.fileContent = content || `No content available for ${file.name}`;
    }
  }

  private updateBreadcrumbPath(folderId: string): void {
    const breadcrumbIndex = this.breadcrumb.findIndex((item) => item.id === folderId);
    if (breadcrumbIndex !== -1) {
      this.breadcrumb = this.breadcrumb.slice(0, breadcrumbIndex + 1);
      this.currentFolderName = this.breadcrumb[breadcrumbIndex].name;
    } else {
      const itemMetaData = this.fileSystemService.getItemMetaData(folderId);
      if (itemMetaData) {
        this.currentFolderName = itemMetaData.name;
        this.breadcrumb.push({id: folderId, name: this.currentFolderName});
      } else {
        this.currentFolderName = this.folderContents.length > 0 ? this.folderContents[0].name : '';
        this.breadcrumb.push({id: folderId, name: this.currentFolderName});
      }
    }
  }

  navigateToBreadcrumb(crumb: { id: string; name: string }): void {
    this.loadFolderContents(crumb.id);
  }

  handleNavigationRequest(navItem: SideBarNavigationLink) {
    if (navItem.linkType === NavigationLinkType.Navigation) {
      if (navItem.dstDirectoryId) {
        this.reBuildBreadCrumbAddress(navItem.path)
        this.loadFolderContents(navItem.dstDirectoryId);
      }
    } else {
      if (navItem.action) {
        navItem.action();
      }
    }
  }

  private reBuildBreadCrumbAddress(pathArray: BreadCrumbPath[]) {
    this.breadcrumb = []
    pathArray.forEach(item => {
      this.breadcrumb.push(item);
    })
  }

  isRootDirectory() {
    return this.currentFolderName === 'My Computer'
  }

  hideFolderTree() {
    this.isFolderTreeVisible = false;
  }

  appendSizeWithUnitOrDefault(size: number | undefined, unit: SizeUnit | undefined): string {
    if (size && unit) {
      return size + unit;
    }
    return '-';
  }

  selectItem(item: FileSystemItem, event: MouseEvent) {
    if (event.ctrlKey) {
      // Multi-select with Ctrl
      this.updateStatusBarData('multiple');
      if (this.selectedItems.has(item.id)) {
        this.selectedItems.delete(item.id);
      } else {
        this.selectedItems.add(item.id);
      }
    } else {
      // Single select
      this.updateSelectedItemMetaData(item.id)
      this.clearSelectedItems();
      this.selectedItems.add(item.id);
    }
  }

  updateStatusBarData(mode: FileSystemItemType | 'multiple' | 'none') {
    if (mode === 'none') {
      this.statusBarData = {
        firstTab: '-',
        secondTab: '-',
        thirdTab: '-',
      }
    } else if (mode === 'multiple') {
      this.statusBarData = {
        firstTab: `Selected Item(s): ${this.selectedItems.size}`,
        secondTab: '-',
        thirdTab: 'Multiple Files Selected',
      }
    } else { //FileSystemItemType
      if (mode === FileSystemItemType.File) {
        this.statusBarData = {
          firstTab: `1 Item`,
          secondTab: `${this.appendSizeWithUnitOrDefault(this.selectedItemMetaData?.size, this.selectedItemMetaData?.spaceUnit) ?? '-'}`,
          thirdTab: this.selectedItemMetaData?.name ?? '-',
        }
      } else
        this.statusBarData = {
          firstTab: `${this.selectedItemMetaData?.childrenCount ?? 0} item(s)`,
          secondTab: `
        Free Space: ${this.appendSizeWithUnitOrDefault(this.selectedItemMetaData?.freeSpace, this.selectedItemMetaData?.spaceUnit)} |
        Capacity: ${this.appendSizeWithUnitOrDefault(this.selectedItemMetaData?.size, this.selectedItemMetaData?.spaceUnit)}`,
          thirdTab: this.selectedItemMetaData?.name ?? '-',
        }
    }
  }

  showContextMenuForItem(event: MouseEvent, item?: FileSystemItem) {
    event.preventDefault();
    this.showContextMenu = true;
    this.contextMenuPosition = {x: event.clientX, y: event.clientY};
    this.contextMenuItem = item || null;
  }

  navigateUp() {
    //The Second to Last Location Index From the Rear (-2)
    let previousPosition = this.breadcrumb.at(-2);
    this.loadFolderContents(previousPosition?.id ?? 'root')
    this.clearSelectedItems();
  }

  clearSelectedItems() {
    this.selectedItems.clear();
  }

  clear() {
    this.selectedItems.clear();
    this.refresh()
  }

  refresh() {
    //The Last Location Index From the Rear (-1)
    let currentLocation = this.breadcrumb.at(-1);
    this.loadFolderContents(currentLocation?.id ?? 'root');
  }

  changeViewMode(mode: 'large' | 'small' | 'list' | 'details') {
    this.viewMode = mode;
  }

  sortItems(by: 'name' | 'size' | 'type' | 'modified') {
    if (this.sortBy === by) {
      // Toggle sort order
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = by;
      this.sortOrder = 'asc';
    }

    // Sort items
    this.folderContents.sort((a, b) => {
      let comparison = 0;

      switch (by) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = TypeParserService.parseSize(a.size, a.spaceUnit) - TypeParserService.parseSize(b.size, b.spaceUnit);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return this.sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  private handleClose() {
    this.windowClose();
  }

  private handleAboutFileExplorer() {
    this.dialogService.showInformation(
      'About File Explorer',
      'File Explorer\n\nVersion 6.0\n\n© 1998 Microsoft Corporation'
    );
  }
}
