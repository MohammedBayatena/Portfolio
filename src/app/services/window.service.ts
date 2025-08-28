import {Injectable} from '@angular/core';
import {Window} from '../models/window.model';
import {BehaviorSubject, Observable} from 'rxjs';
import {MovableItemsHandlerAbstractService} from './movable-items-handler.abstract.service';

@Injectable({
  providedIn: 'root'
})
export class WindowService extends MovableItemsHandlerAbstractService {


  private windows: Window[] = [];
  private windowsSubject = new BehaviorSubject<Window[]>([]);
  override components$: Observable<Window[]> = this.windowsSubject.asObservable();

  private highestZIndex = 100;

  constructor() {
    super();
  }

  getWindows(): Window[] {
    return this.windows;
  }

  override open(window: Window): void {
    // Check if window is already open
    const existingWindow = this.windows.find(w => w.id === window.id);
    if (existingWindow) {
      this.bringToFront(existingWindow.id);
      if (existingWindow.minimized) {
        existingWindow.minimized = false;
        this.updateWindows();
      }
      return;
    }

    // Set a higher z-index for the new window
    window.zIndex = ++this.highestZIndex;

    this.windows.push(window);
    this.updateWindows();
  }

  override close(windowId: string): void {
    this.windows = this.windows.filter(w => w.id !== windowId);
    this.updateWindows();
  }

  override bringToFront(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.zIndex = ++this.highestZIndex;
      this.updateWindows();
    }
  }

  override move(windowId: string, x: number, y: number): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.x = x;
      window.y = y;
      this.updateWindows();
    }
  }

  override resize(windowId: string, width: number, height: number): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.width = width;
      window.height = height;
      this.updateWindows();
    }
  }

  minimizeWindow(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.minimized = true;
      this.updateWindows();
    }
  }

  restoreWindow(windowId: string): void {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.minimized = false;
      this.bringToFront(windowId);
      this.updateWindows();
    }
  }

  private updateWindows(): void {
    this.windowsSubject.next([...this.windows]);
  }
}
