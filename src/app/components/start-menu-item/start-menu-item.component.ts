import {CommonModule, NgOptimizedImage} from '@angular/common';
import {StartMenuItem} from '../../models/start-menu-item.model';
import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'start-menu-item',
  templateUrl: './start-menu-item.component.html',
  styleUrls: ['./start-menu-item.component.scss'],
  imports: [CommonModule, NgOptimizedImage],
})
export class StartMenuItemComponent {
  @Input() item!: StartMenuItem;

  @Output() itemClick = new EventEmitter<StartMenuItem>();

  constructor() {}

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.itemClick.emit(this.item);
  }
}
