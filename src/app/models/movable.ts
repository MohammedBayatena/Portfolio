export interface Movable {
  id: string;
  title: string;
  contentComponent: any;
  contentInputs?: any;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}
