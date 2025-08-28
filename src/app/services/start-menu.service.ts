import {Injectable} from '@angular/core';
import {StartMenu} from '../models/start-menu.model';

@Injectable({
  providedIn: 'root',
})
export class StartMenuService {
  constructor() {}

  openMenu(startMenu: StartMenu): void {
    startMenu.visible = true;
  }

  closeMenu(startMenu: StartMenu): void {
    startMenu.visible = false;
  }
}
