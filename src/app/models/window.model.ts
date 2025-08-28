import {Movable} from './movable';

export interface Window extends Movable {
  minimized: boolean;
  addMinimizeAsInput: boolean;
}
