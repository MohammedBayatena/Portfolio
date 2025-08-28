import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {ScreenSaverSettings} from '../models/screen-saver-settings.model';
import {StateService} from './state.service';

@Injectable({
  providedIn: 'root',
})
export class WindowsDesktopSettingsService {
  // Screen saver settings
  private screenSaverSettings;
  screenSaverSettings$;

  constructor(private stateService: StateService) {

    const savedState = this.stateService.loadState();

    if (savedState?.screenSaverSettings) {
      this.screenSaverSettings = new BehaviorSubject<ScreenSaverSettings>({
        screenSaverTimeOut: savedState.screenSaverSettings.screenSaverTimeOut,
        screenSaverType: savedState.screenSaverSettings.screenSaverType,
        screenSaverEnabled: savedState.screenSaverSettings.screenSaverEnabled,
        isScreenSaverPreview: savedState.screenSaverSettings.isScreenSaverPreview
      });
    } else {
      this.screenSaverSettings = new BehaviorSubject<ScreenSaverSettings>({
        screenSaverTimeOut: 1,
        screenSaverType: 'none',
        screenSaverEnabled: false,
        isScreenSaverPreview: false
      });
    }
    this.screenSaverSettings$ = this.screenSaverSettings.asObservable()
  }


  applyScreenSaverSettings(settings: ScreenSaverSettings): void {
    this.screenSaverSettings.next(settings);
    this.stateService.saveScreenSaverSettings(settings);
  }
}
