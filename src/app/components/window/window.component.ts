import {Component, ElementRef, Input, ViewChild,} from '@angular/core';
import {Window} from '../../models/window.model';
import {WindowService} from '../../services/window.service';
import {CommonModule} from '@angular/common';
import {MovableComponent} from '../abstract-components/movable.component';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss'],
  imports: [CommonModule]
})
export class WindowComponent extends MovableComponent {

  override ngOnInit(): void {
    // Bring window to front when initialized
    this.windowService.bringToFront(this.instance.id);
  }

  override ngOnDestroy(): void {
    // Clean up event listeners if any
  }

  @Input() override instance!: Window;
  @Input() theme: any;
  @ViewChild('windowContent') windowContent!: ElementRef;
  @ViewChild('titleBar') titleBar!: ElementRef;


  constructor(private windowService: WindowService) {
    super(windowService);
  }

  onMinimizeClick(): void {
    this.windowService.minimizeWindow(this.instance.id);
  }

  overrideChildInputs(instance: Window) {
    if (instance.addMinimizeAsInput) {
      return {...instance.contentInputs, minimized: instance.minimized};
    }
    return instance.contentInputs
  }

}
