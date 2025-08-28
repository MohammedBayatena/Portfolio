import {Observable} from 'rxjs';
import {Movable} from '../models/movable';

export abstract class MovableItemsHandlerAbstractService {

  abstract components$: Observable<Movable[]>;

  abstract open(instance: Movable): void

  abstract close(id: string): void

  abstract bringToFront(id: string): void;

  abstract move(id: string, x: number, y: number): void

  abstract resize(id: string, width: number, height: number): void

}
