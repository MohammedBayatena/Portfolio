import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {DialogType, DialogOptions, DialogResult, Dialog} from '../models/dialog.model';
import {MovableItemsHandlerAbstractService} from './movable-items-handler.abstract.service';

@Injectable({
  providedIn: 'root'
})
export class DialogService extends MovableItemsHandlerAbstractService {

  //Movable Dialog Properties
  private dialogs: Dialog[] = [];
  private dialogsSubject: BehaviorSubject<Dialog[]> = new BehaviorSubject<Dialog[]>([]);
  override components$: Observable<Dialog[]> = this.dialogsSubject.asObservable();
  //Note: Dialogs should have the Highest Z-index of all Movable Components
  private highestZIndex = 200;

  //Non-Movable Dialog Properties
  private dialogSubject = new Subject<DialogOptions>();
  private resultSubject = new Subject<DialogResult>();
  dialog$ = this.dialogSubject.asObservable();
  result$ = this.resultSubject.asObservable();

  override open(dialog: Dialog): void {
    const existingDialog = this.dialogs.find(d => d.id === dialog.id);
    if (existingDialog) {
      this.bringToFront(existingDialog.id);
      this.updateDialogs();
      return;
    }

    // Set a higher z-index for the new window
    dialog.zIndex = ++this.highestZIndex;
    this.dialogs.push(dialog);
    this.updateDialogs();
  }

  override close(id: string): void {
    this.dialogs = this.dialogs.filter(d => d.id !== id);
    this.updateDialogs();
  }

  override bringToFront(id: string): void {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.zIndex = ++this.highestZIndex;
      this.updateDialogs();
    }
  }

  override move(id: string, x: number, y: number): void {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.x = x;
      dialog.y = y;
      this.updateDialogs();
    }
  }

  override resize(id: string, width: number, height: number): void {
    const dialog = this.dialogs.find(d => d.id === id);
    if (dialog) {
      dialog.width = width;
      dialog.height = height;
      this.updateDialogs();
    }
  }

  private updateDialogs(): void {
    this.dialogsSubject.next([...this.dialogs]);
  }

  showConfirmation(title: string, message: string, confirmText = 'Yes', cancelText = 'Cancel'): Observable<DialogResult> {
    this.dialogSubject.next({
      type: DialogType.CONFIRMATION,
      title,
      message,
      confirmText,
      cancelText
    });
    return this.result$;
  }

  showInformation(title: string, message: string, okText = 'OK'): Observable<DialogResult> {
    this.dialogSubject.next({
      type: DialogType.INFORMATION,
      title,
      message,
      okText
    });
    return this.result$;
  }

  showError(title: string, message: string, okText = 'OK'): Observable<DialogResult> {
    this.dialogSubject.next({
      type: DialogType.ERROR,
      title,
      message,
      okText
    });
    return this.result$;
  }

  closeDialog(result: boolean) {
    this.resultSubject.next({confirmed: result});
  }
}
