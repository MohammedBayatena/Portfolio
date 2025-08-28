import {Component, Input} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ContextMenuModel} from '../../models/context-menu.model';

@Component({
  selector: 'app-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
  imports: [CommonModule]
})
export class ContextMenuComponent {
  @Input() x = 0;
  @Input() y = 0;
  @Input() visible = false;

  @Input() contextMenuModel: ContextMenuModel[] = [];

  constructor() {
  }

  executeAction(menuModel: ContextMenuModel) {
    if (menuModel.disabled || menuModel.divider) return;
    if (menuModel.action) {
      menuModel.action();
    }
  }


  // createNewFolder() {
  //   const folderName = prompt('Enter folder name:', 'New Folder');
  //   if (folderName) {
  //     const newFolder: FileSystemItem = {
  //       id: `folder-${Date.now()}`,
  //       name: folderName,
  //       type: 'folder',
  //       size: '-',
  //       modified: new Date().toLocaleDateString(),
  //       icon: '📁'
  //     };
  //
  //     this.items.unshift(newFolder);
  //   }
  // }

  // deleteSelected() {
  //   if (this.selectedItems.size === 0) return;
  //
  //   const count = this.selectedItems.size;
  //   const message = count === 1
  //     ? 'Are you sure you want to delete this item?'
  //     : `Are you sure you want to delete these ${count} items?`;
  //
  //   if (confirm(message)) {
  //     // Remove selected items
  //     this.items = this.items.filter(item => !this.selectedItems.has(item.id));
  //     this.selectedItems.clear();
  //   }
  // }


}
