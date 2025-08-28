import {Component, Input} from '@angular/core';
import {NgComponentOutlet} from "@angular/common";
import {MovableComponent} from '../abstract-components/movable.component';
import {DialogService} from '../../services/dialog.service';
import {Dialog} from '../../models/dialog.model';

@Component({
  selector: 'app-dialog',
  imports: [
    NgComponentOutlet
  ],
  templateUrl: './dialog-wrapper-component.html',
  styleUrl: './dialog-wrapper-component.scss'
})
export class DialogWrapper extends MovableComponent {
  @Input() override instance!: Dialog;

  constructor(private dialogService: DialogService) {
    super(dialogService);
  }

  override ngOnInit(): void {
    // Bring window to front when initialized
    this.dialogService.bringToFront(this.instance.id);
  }

  override ngOnDestroy(): void {
    // Clean up event listeners if any
  }
}
