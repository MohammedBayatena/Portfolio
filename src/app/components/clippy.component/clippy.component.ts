import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener, Inject,
  OnInit, PLATFORM_ID,
  ViewChild
} from '@angular/core';
import {CommonModule, isPlatformBrowser, NgOptimizedImage} from '@angular/common';
import {ContextMenuComponent} from '../context-menu/context-menu.component';
import {ContextMenuModel} from '../../models/context-menu.model';
import {ClippyIntelligenceService} from '../../services/clippy-intelligence.service';

@Component({
  selector: 'app-clippy',
  templateUrl: './clippy.component.html',
  standalone: true,
  imports: [
    CommonModule,
    NgOptimizedImage,
    ContextMenuComponent
  ],
  styleUrls: ['./clippy.component.scss']
})
export class ClippyComponent implements OnInit {

  // @Input() clippyHelpModel: AssistantHelpModel;
  // References to DOM elements
  @ViewChild('clippyContainer') clippyContainer!: ElementRef;
  @ViewChild('leftPupil') leftPupil!: ElementRef;
  @ViewChild('rightPupil') rightPupil!: ElementRef;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private changeDetector: ChangeDetectorRef,
    private intelligenceService: ClippyIntelligenceService) {
  }

  //Clippy Effects
  private isTricksEnabled = true;
  private isMoveAroundEnabled = true;
  private tricksInterval: any;
  private moveInterval: any;

  //Clippy Visibility
  clippyVisible = false;

  // Clippy phrases
  clippyPhrases: string[] = [
    "Did You Know you can Search for Files and Folders? Do you want me to open Search Window?",
    "Did you know you can customize your desktop?",
    "You might want to Check Internet Explorer. Would You Like me to open it for you?",
    "You seem to be clicking around a lot. Are you looking for something specific?",
    "You can always hide Clippy from Start Menu -> Help -> Clippy -> Remove From Desktop"
  ];

  // Component state
  speechBubbleVisible: boolean = false;
  currentPhrase: string = "";
  windowVisible: boolean = false;

  //Clippy Parameters
  doingATrick: boolean = false;
  clippyBodySrc: string = '/assets/clippy/clippy.png';
  clippyTrickSrc: string = '/assets/clippy/source.gif';

  // Drag and Drop Parameters
  private isDragging = false;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private currentX = 0;
  private currentY = 0;

  // Document Window Injection
  // window Cannot be Accessed With Browser API when Doing Server Side Rendering
  private Window: Window | null = null;

  // Context Menu Parameters
  showContextMenu: boolean = false;
  contextMenuPosition = {x: 0, y: 0};
  contextMenuModel: ContextMenuModel[] = [
    {
      id: 'close',
      label: "Unpin From Desktop",
      action: () => {
        this.clippyVisible = false;
      },
      children: []
    },
    {
      id: 'tricks',
      label: "Tricks",
      children: [
        {
          id: 'spin',
          label: 'Disable Spinning',
          action: () => {
            let action
            if (this.isTricksEnabled) {
              action = 'Enable'
              clearInterval(this.tricksInterval)
            } else {
              action = 'Disable'
              this.AddTrickEffects()
            }

            this.isTricksEnabled = !this.isTricksEnabled;
            this.contextMenuModel[1].children[0] = {
              ...this.contextMenuModel[1].children[0],
              label: `${action} Spinning`
            }
          },
          children: []
        },
        {
          id: 'move',
          label: 'Disable Moving',
          action: () => {
            let action
            if (this.isMoveAroundEnabled) {
              action = 'Enable'
              clearInterval(this.moveInterval)
            } else {
              action = 'Disable'
              this.AddMoveEffects()
            }
            this.isMoveAroundEnabled = !this.isMoveAroundEnabled;
            this.contextMenuModel[1].children[1] = {
              ...this.contextMenuModel[1].children[1],
              label: `${action} Moving`
            }
          },
          children: []
        }
      ]
    }
  ]

  ngOnInit(): void {
    this.Window = this.getWindow()

    this.intelligenceService.intelligentSuggestion$.subscribe(value => {
        this.showSpeechBubble(value.helpPhrase)
      }
    )

    this.intelligenceService.clippyEnabled$.subscribe(value => {
      this.clippyVisible = value
    })


    // Move Clippy every 15 seconds
    if (this.isMoveAroundEnabled) {
      this.AddMoveEffects()
    }

    //Do A Trick Every 15 Seconds
    if (this.isTricksEnabled) {
      this.AddTrickEffects()
    }
    // Show random speech bubble every 30 seconds
    setInterval(() => {
      if (!this.speechBubbleVisible) {
        this.showSpeechBubble();
      }
    }, 30000);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showContextMenu = false;
  }

  // Eye tracking
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (!this.clippyContainer || !this.leftPupil || !this.rightPupil) return;

    this.trackEyes(event.clientX, event.clientY);

    if (this.isDragging) {

      event.preventDefault();

      // Calculate new position
      const newX = event.clientX - this.dragOffsetX;
      const newY = event.clientY - this.dragOffsetY;

      // Boundary checks
      const clippyElement = this.clippyContainer.nativeElement;
      const maxX = window.innerWidth - clippyElement.offsetWidth;
      const maxY = window.innerHeight - clippyElement.offsetHeight

      this.currentX = Math.max(0, Math.min(newX, maxX));
      this.currentY = Math.max(0, Math.min(newY, maxY));

      this.updateClippyPosition();
    }
  }

  // Event handlers
  onContextMenuClick(event: MouseEvent) {
    event.preventDefault();
    this.showContextMenu = true;
    this.contextMenuPosition = {x: event.clientX, y: event.clientY};
  }

  onMouseDownDragStart(event: MouseEvent): void {
    if (!this.clippyContainer) return;

    event.preventDefault();

    const clippyElement = this.clippyContainer.nativeElement;
    const rect = clippyElement.getBoundingClientRect();

    this.isDragging = true;
    this.dragOffsetX = event.clientX - rect.left;
    this.dragOffsetY = event.clientY - rect.top;

    // Prevent text selection during drag
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'grabbing';
  }

  onMouseUp(): void {
    if (!this.isDragging) return;

    this.isDragging = false;

    // Reset cursor and text selection
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }

  onClippyClick(): void {

    if (this.isDragging) {
      this.isDragging = false;
      return;
    }

    if (this.speechBubbleVisible) {
      this.speechBubbleVisible = false;
    } else {
      this.showSpeechBubble();
    }
  }

  onYesClick(): void {
    this.currentPhrase = "Great! I'm here to help. Just click on the Clippy window that opened!";
    this.speechBubbleVisible = true;
    this.windowVisible = true;

    setTimeout(() => {
      this.speechBubbleVisible = false;
    }, 3000);
  }

  onNoClick(): void {
    this.currentPhrase = "No problem! I'll be here if you need me.";
    this.speechBubbleVisible = true;

    setTimeout(() => {
      this.speechBubbleVisible = false;
    }, 2000);
  }

  onCloseClick(): void {
    this.windowVisible = false;
    this.currentPhrase = "Window closed! Let me know if you need anything else.";
    this.speechBubbleVisible = true;

    setTimeout(() => {
      this.speechBubbleVisible = false;
    }, 3000);
  }

  onMinimizeClick(): void {
    this.windowVisible = false;
    this.currentPhrase = "Window minimized! You can reopen it by clicking on me.";
    this.speechBubbleVisible = true;

    setTimeout(() => {
      this.speechBubbleVisible = false;
    }, 3000);
  }

  //Track Mouse Coordinates With Eyes
  private trackEyes(ClientX: number, ClientY: number): void {
    const clippyElement = this.clippyContainer.nativeElement;
    const clippyRect = clippyElement.getBoundingClientRect();
    const clippyCenterX = clippyRect.left + clippyRect.width / 2;
    const clippyCenterY = clippyRect.top + clippyRect.height / 2;

    const angle = Math.atan2(ClientY - clippyCenterY, ClientX - clippyCenterX);
    const distance = Math.min(3, Math.hypot(ClientX - clippyCenterX, ClientY - clippyCenterY) / 100);

    const pupilX = Math.cos(angle) * distance + 4;
    const pupilY = Math.sin(angle) * distance + 4;

    this.leftPupil.nativeElement.style.left = pupilX + 'px';
    this.leftPupil.nativeElement.style.top = pupilY + 'px';
    this.rightPupil.nativeElement.style.left = pupilX + 'px';
    this.rightPupil.nativeElement.style.top = pupilY + 'px';
  }

  //Do Some Trick
  private doFancyTricks(): void {
    this.doingATrick = !this.doingATrick;
    this.changeDetector.detectChanges();
  }

  // Update Clippy's position
  private updateClippyPosition(): void {
    if (!this.clippyContainer) return;

    const clippyElement = this.clippyContainer.nativeElement;

    const maxX = window.innerWidth - clippyElement.offsetWidth;
    const maxY = window.innerHeight - clippyElement.offsetHeight;

    const x = Math.min(this.currentX, maxX);
    const y = Math.min(this.currentY, maxY);

    clippyElement.style.left = x + 'px';
    clippyElement.style.top = y + 'px';
    clippyElement.style.right = 'auto';
  }

  // Show speech bubble with random phrase
  private showSpeechBubble(speechBubbleContent?: string): void {

    if (speechBubbleContent) {
      this.currentPhrase = speechBubbleContent
    } else {
      this.currentPhrase = this.clippyPhrases[Math.floor(Math.random() * this.clippyPhrases.length)];
    }

    this.speechBubbleVisible = true;
    this.changeDetector.detectChanges();

    // Hide after 15 seconds if no interaction
    setTimeout(() => {
      if (this.speechBubbleVisible) {
        this.speechBubbleVisible = false;
        this.changeDetector.detectChanges();
      }
    }, 15000);
  }

  // Move Clippy to random position
  private moveClippyAround(): void {

    if (!this.clippyContainer || !this.Window) return;

    const clippyElement = this.clippyContainer.nativeElement;
    const maxX = this.Window.innerWidth - clippyElement.offsetWidth - 200;
    const maxY = this.Window.innerHeight - clippyElement.offsetHeight - 200;

    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY) + 20;

    clippyElement.style.left = randomX + 'px';
    clippyElement.style.bottom = (this.Window.innerHeight - randomY - clippyElement.offsetHeight) + 'px';
    clippyElement.style.right = 'auto';
  }

  private AddMoveEffects() {
    this.moveInterval = setInterval(() => this.moveClippyAround(), 15000);
  }

  private AddTrickEffects() {
    this.tricksInterval = setInterval(() => {
      this.doFancyTricks();
    }, 15000)

  }

  private getWindow(): Window | null {
    if (isPlatformBrowser(this.platformId)) {
      return window;
    }
    return null;
  }
}
