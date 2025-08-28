import {Component, Input, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DialogService} from '../../services/dialog.service';
import {DialogType, DialogOptions} from '../../models/dialog.model';
import {Subscription} from 'rxjs';
import {NoisyComponent} from '../abstract-components/noisy.component';

@Component({
  selector: 'app-win98-basic-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win98-basic-dialog.component.html',
  styleUrls: ['./win98-basic-dialog.component.scss']
})
export class Win98BasicDialogComponent extends NoisyComponent implements OnDestroy {
  override noiseUrl: string;
  @Input() options: DialogOptions | null = null;

  private DialogNotificationURL = '/assets/sounds/w98dialogueOpen.mp3';

  isVisible = false;
  private subscription: Subscription;

  constructor(
    private dialogService: DialogService) {
    super();
    this.noiseUrl = this.DialogNotificationURL
    this.subscription = this.dialogService.dialog$.subscribe(options => {
      this.options = options;
      this.isVisible = true;
      this.makeSound()
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  get DialogType() {
    return DialogType;
  }

  onConfirm() {
    this.dialogService.closeDialog(true);
    this.isVisible = false;
  }

  onNo() {
    this.dialogService.closeDialog(false);
    this.isVisible = false;
  }

  onOk() {
    this.dialogService.closeDialog(true);
    this.isVisible = false;
  }

  getIcon(): string {
    if (!this.options) return '';

    switch (this.options.type) {
      case DialogType.CONFIRMATION:
        return '❓';
      case DialogType.INFORMATION:
        return 'ℹ️';
      case DialogType.ERROR:
        return '❗';
      default:
        return '';
    }
  }

}
