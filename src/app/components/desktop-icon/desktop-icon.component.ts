import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DesktopIcon} from '../../models/desktop-icon.model';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {NoisyComponent} from '../abstract-components/noisy.component';

@Component({
  selector: 'app-desktop-icon',
  templateUrl: './desktop-icon.component.html',
  styleUrls: ['./desktop-icon.component.scss'],
  imports: [CommonModule, NgOptimizedImage]
})
export class DesktopIconComponent extends NoisyComponent {
  override noiseUrl: string;

  @Input() icon!: DesktopIcon;
  @Input() selected = false;
  @Input() theme: any;
  @Output() iconClick = new EventEmitter<DesktopIcon>();
  @Output() iconDoubleClick = new EventEmitter<DesktopIcon>();
  @Output() iconRightClick = new EventEmitter<{ icon: DesktopIcon, event: MouseEvent }>();

  constructor() {
    super();
    this.noiseUrl = 'assets/sounds/mouse-click.mp3';
  }

  onClick(event: MouseEvent): void {
    event.stopPropagation();
    this.makeSound()
    this.iconClick.emit(this.icon);
  }

  onDoubleClick(event: MouseEvent): void {
    event.stopPropagation();
    this.iconDoubleClick.emit(this.icon);
  }

  onRightClick(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.iconRightClick.emit({icon: this.icon, event});
  }
}
