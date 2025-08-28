import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';

@Component({
  selector: 'app-win98-game-emulator.component',
  imports: [],
  templateUrl: './win98-game-emulator.component.html',
  styleUrl: './win98-game-emulator.component.scss'
})
export class Win98GameEmulatorComponent implements AfterViewInit {

  @Input() gameTitle: string = '';
  @Input() gameURL: string = '';
  @ViewChild('gameFrame') gameFrame!: ElementRef<HTMLIFrameElement>;

  isLoading: boolean = false;

  ngAfterViewInit() {
    this.loadUrl();
  }

  loadUrl() {
    if (!this.gameURL) return;

    this.isLoading = true;

    // Load the URL in iframe
    if (this.gameFrame) {
      this.gameFrame.nativeElement.onload = () => {
        this.isLoading = false;
      };

      this.gameFrame.nativeElement.onerror = () => {
        this.isLoading = false;
      };

      this.gameFrame.nativeElement.src = this.gameURL;
    }
  }
}
