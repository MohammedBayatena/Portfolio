import {Component, HostListener, Input, OnDestroy, OnInit} from '@angular/core';
import {Movable} from '../../models/movable';
import {MovableItemsHandlerAbstractService} from '../../services/movable-items-handler.abstract.service';


@Component({
  selector: 'app-movable-component',
  template: ``
})
export abstract class MovableComponent implements OnInit, OnDestroy {
  @Input() abstract instance: Movable;

  abstract ngOnInit(): void;

  abstract ngOnDestroy(): void;

  isDragging = false;
  dragOffsetX = 0;
  dragOffsetY = 0;
  isResizing = false;
  resizeDirection = '';
  resizeStartX = 0;
  resizeStartY = 0;
  resizeStartWidth = 0;
  resizeStartHeight = 0;


  private service: MovableItemsHandlerAbstractService;

  protected constructor(service: MovableItemsHandlerAbstractService) {
    this.service = service;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && window) {

      const maxX = window.innerWidth - this.instance.width;
      const maxY = window.innerHeight - this.instance.height;

      // Clamp x and y within the window bounds
      let x = event.clientX - this.dragOffsetX;
      let y = event.clientY - this.dragOffsetY;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      this.service.move(this.instance.id, x, y);
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.resizeStartX;
      const deltaY = event.clientY - this.resizeStartY;

      let newWidth = this.resizeStartWidth;
      let newHeight = this.resizeStartHeight;

      if (this.resizeDirection.includes('e')) {
        newWidth = Math.max(200, this.resizeStartWidth + deltaX);
      }
      if (this.resizeDirection.includes('w')) {
        newWidth = Math.max(200, this.resizeStartWidth - deltaX);
      }
      if (this.resizeDirection.includes('s')) {
        newHeight = Math.max(150, this.resizeStartHeight + deltaY);
      }
      if (this.resizeDirection.includes('n')) {
        newHeight = Math.max(150, this.resizeStartHeight - deltaY);
      }

      this.service.resize(this.instance.id, newWidth, newHeight);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
  }

  onTitleBarMouseDown(event: MouseEvent): void {
    if (event.button === 0) {
      // Left mouse button
      this.isDragging = true;
      this.dragOffsetX = event.clientX - this.instance.x;
      this.dragOffsetY = event.clientY - this.instance.y;
      this.service.bringToFront(this.instance.id);
    }
  }

  onResizeMouseDown(event: MouseEvent, direction: string): void {
    event.stopPropagation();
    this.isResizing = true;
    this.resizeDirection = direction;
    this.resizeStartX = event.clientX;
    this.resizeStartY = event.clientY;
    this.resizeStartWidth = this.instance.width;
    this.resizeStartHeight = this.instance.height;
    this.service.bringToFront(this.instance.id);
  }

  onWindowClick(): void {
    this.service.bringToFront(this.instance.id);
  }

  onCloseClick(): void {
    this.service.close(this.instance.id);
  }

}
