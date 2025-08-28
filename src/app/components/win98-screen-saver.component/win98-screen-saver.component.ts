import {
  Component,
  HostListener,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  ChangeDetectorRef
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {PipesService} from './pipes.service';
import {BehaviorSubject, Observable} from 'rxjs';
import {WindowsDesktopSettingsService} from '../../services/desktop-settings.service';
import {ScreenSaverSettings} from '../../models/screen-saver-settings.model';

@Component({
  selector: 'app-win98-screen-saver',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './win98-screen-saver.component.html',
  styleUrls: ['./win98-screen-saver.component.scss']
})
export class Win98ScreenSaverComponent implements OnInit, OnDestroy {
  screenSaverSettings: ScreenSaverSettings = {
    screenSaverTimeOut: 5,
    screenSaverEnabled: false,
    screenSaverType: 'clock',
    isScreenSaverPreview: false
  };

  @Output() screenSaverActivated = new EventEmitter<void>();
  @Output() screenSaverDeactivated = new EventEmitter<void>();

  private canvas?: ElementRef;

  @ViewChild('canvas') set content(content: ElementRef<HTMLCanvasElement>) {
    if (content) { // initially setter gets called with undefined
      this.canvas = content;
    }
  }

  private timeout?: number;
  private timer: any;
  private isActive: boolean = false;

  // Screen saver state
  private time = new BehaviorSubject<Date>(new Date());
  currentTime$: Observable<Date> = this.time.asObservable();
  private timeInterval: any;

  constructor(
    private pipesService: PipesService,
    private windowsDesktopSettingsService: WindowsDesktopSettingsService,
    private changeDetectorRef: ChangeDetectorRef
  ) {
    this.resetTimer();
  }

  ngOnInit() {
    this.windowsDesktopSettingsService.screenSaverSettings$
      .subscribe(screenSaverSettings => {
        this.screenSaverSettings = screenSaverSettings
        if (screenSaverSettings.screenSaverEnabled) {
          this.timeout = screenSaverSettings.screenSaverTimeOut * 60 * 1000
          this.startTimer();
        } else {
          this.clearScreenSaver();
        }
      })
  }

  ngOnDestroy() {
    this.clearTimer();
    this.clearTimeInterval();
    this.stopAnimation();
  }

  @HostListener('document:mousemove')
  @HostListener('document:keypress')
  @HostListener('document:click')
  @HostListener('document:scroll')
  @HostListener('document:touchstart')
  onUserActivity() {
    if (this.screenSaverSettings.screenSaverEnabled) {
      this.resetTimer();
      if (this.isActive) {
        this.deactivateScreenSaver();
      }
    }
  }

  private startTimer() {
    this.clearTimer();
    this.timer = setTimeout(() => {
      this.activateScreenSaver();
    }, this.timeout);
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private resetTimer() {
    if (this.screenSaverSettings.screenSaverEnabled && !this.isActive) {
      this.startTimer();
    }
  }

  private activateScreenSaver() {
    this.isActive = true;
    this.screenSaverActivated.emit();

    // Start updating the time display
    this.clearTimeInterval();

    this.animateClockScreenSaver();


    //Detect Changes in Component Dom Availability
    this.changeDetectorRef.detectChanges();

    //If Canvas Not Rendered Return
    if (!this.canvas?.nativeElement || this.screenSaverSettings.screenSaverType !== 'pipes') {
      return;
    }

    this.animatePipesScreenSaver(this.canvas.nativeElement)
  }

  public deactivateScreenSaver() {
    this.isActive = false;
    //When ScreenSaver is in Preview Mode, Screen saver is turned off after Preview is done
    if (this.screenSaverSettings.isScreenSaverPreview) {
      this.windowsDesktopSettingsService.applyScreenSaverSettings({
        ...this.screenSaverSettings,
        screenSaverEnabled: false
      });
    }
    this.screenSaverDeactivated.emit();
    this.clearScreenSaver();
  }

  clearScreenSaver(): void {
    this.clearTimeInterval();
    this.stopAnimation();
    this.resetTimer();
  }

  private animateClockScreenSaver() {
    this.timeInterval = setInterval(() => {
      this.time.next(new Date());
    }, 1000);
  }

  private animatePipesScreenSaver(canvas: HTMLCanvasElement) {
    // Initialize canvas with pipes service
    this.pipesService.initCanvas(canvas);
    // Start pipe animation
    this.startAnimation();
  }

  private clearTimeInterval() {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
      this.timeInterval = null;
    }
  }

  get isActiveScreenSaver(): boolean {
    return this.isActive;
  }

  private startAnimation() {
    this.pipesService.startAnimation();
  }

  private stopAnimation() {
    this.pipesService.stopAnimation();
  }
}
