import {Component, Input, Output, EventEmitter, HostListener} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ToolbarAction, ToolbarModel} from '../../models/window-toolbar.model';

@Component({
  selector: 'app-win98-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win98-window-toolbar.component.html',
  styleUrls: ['./win98-window-toolbar.component.scss']
})
export class Win98ToolbarComponent {
  @Input() model: ToolbarModel = {dropdowns: []};
  @Output() actionTriggered = new EventEmitter<string>();

  activeDropdown: string | null = null;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close dropdowns when clicking outside
    const target = event.target as HTMLElement;
    if (!target.closest('.toolbar') || !target.closest('.menu-item')) {
      this.activeDropdown = null;
    }
  }

  toggleDropdown(dropdownId: string) {
    if (this.activeDropdown === dropdownId) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = dropdownId;
    }
  }

  executeAction(action: ToolbarAction) {
    if (action.disabled || action.divider) return;

    if (action.action) {
      action.action();
    }

    this.actionTriggered.emit(action.id);
    this.activeDropdown = null;
  }
}
