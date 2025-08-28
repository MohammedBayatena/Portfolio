import {Component, EventEmitter, Input, Output} from '@angular/core';
import {SideBarNavigationLink} from '../../services/file-system.service';
import {CommonModule, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-navigation-tree-item',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './navigation-tree-item.component.html',
  styleUrl: './navigation-tree-item.component.scss'
})
export class NavigationTreeItemComponent {

  @Input() item!: SideBarNavigationLink;
  // This event will propagate the click up to the parent
  @Output() bubbleUp = new EventEmitter<SideBarNavigationLink>();

  toggleItem(item: SideBarNavigationLink): void {
    item.isExpanded = !item.isExpanded;
  }

  trackByFn(index: number, item: SideBarNavigationLink) {
    return item.dstDirectoryId || index;
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation(); // Prevent browser event bubbling
    this.bubbleUp.emit(this.item); // Send the node up the component tree
  }

  // Handle bubbling from children
  onBubbleUp(node: any) {
    this.bubbleUp.emit(node); // Continue bubbling up
  }

}
