import {Movable} from './movable';

export enum DialogType {
  CONFIRMATION = 'confirmation',
  INFORMATION = 'information',
  ERROR = 'error',
  FIND = 'find'
}

export interface Dialog extends Movable {
  type: DialogType;
}


export interface DialogOptions {
  type: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  okText?: string;
}

export interface DialogResult {
  confirmed: boolean;
}
