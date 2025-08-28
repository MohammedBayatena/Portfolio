import {Injectable} from '@angular/core';
import {WindowService} from './window.service';
import {ThemeService} from './theme.service';
import {BehaviorSubject, Observable, skip, Subject} from 'rxjs';
import {AssistantHelpModel} from '../models/assistant-help.model';


@Injectable({
  providedIn: 'root',
})
export class ClippyIntelligenceService {

  private clippyThemeRelatedTips: string[] = [
    "Did you know you can customize your screen-Saver as well?",
    "Looks like you've set a new wallpaper. Did you know you can upload your own?"
  ]

  private clippyBrowserRelatedTips: string[] = [
    "Looks like you're trying to browse the web. Would you like some help?",
    "You seem to be enjoying this website? Did you know you can bookmark it?",
    "Cross-Origin Security Policy is awesome! Dont you agree? Lots of attacks thwarted <3",
  ]

  private clippyNotePadRelatedTips: string[] = [
    "It appears you're writing a document. Need assistance with formatting?",
    "I notice you haven't saved your work recently. Would you like to do that now?",
  ]

  private myCvRelatedTips: string[] = [
    "It appears you are viewing my CV. Do you plan on giving me a call?",
    "Looks like my CV is of interest to you. Would you like to visit my LinkedIn?"
  ]

  private gameRelatedTips: string[] = [
    "You have just found the good Stuff! Did you know you can run games in Fullscreen?",
    "You appear to be gaming! Did you know you can move me around away from your game?"
  ]

  private intelligentSuggestion: BehaviorSubject<AssistantHelpModel> = new BehaviorSubject<AssistantHelpModel>(
    {
      action: () => {
      },
      helpPhrase: "Welcome To My Portfolio. It Seems you have meet Clippy, fell free to explore my Virtual PC. Also check my CV! "
    });

  intelligentSuggestion$ = this.intelligentSuggestion.asObservable();

  private clippyEnabled: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  clippyEnabled$: Observable<boolean> = this.clippyEnabled.asObservable();

  constructor(
    windowService: WindowService,
    themeService: ThemeService) {

    windowService.components$.subscribe((components) => {

      const latestComponent = components.at(-1);
      if (latestComponent) {
        const componentId = latestComponent.id.toLowerCase();
        switch (true) {
          case componentId.includes('notepad'):
            this.intelligentSuggestion.next(
              {
                action: () => {
                },
                helpPhrase: this.getRandomTip(this.clippyNotePadRelatedTips)
              })
            break;
          case componentId.includes('internet-explorer'):
            this.intelligentSuggestion.next(
              {
                action: () => {
                },
                helpPhrase: this.getRandomTip(this.clippyBrowserRelatedTips)
              })
            break;
          case componentId.includes('my-cv'):
            this.intelligentSuggestion.next(
              {
                action: () => {
                },
                helpPhrase: this.getRandomTip(this.myCvRelatedTips)
              })
            break;
          case componentId.includes('game'):
            this.intelligentSuggestion.next(
              {
                action: () => {
                },
                helpPhrase: this.getRandomTip(this.gameRelatedTips)
              }
            )
            break;
          default:
            break;
        }
      }

    })

    themeService.currentBackGround$.pipe(skip(1)).subscribe((backGround) => {
      this.intelligentSuggestion.next(
        {
          action: () => {
          },
          helpPhrase: this.getRandomTip(this.clippyThemeRelatedTips)
        })
    })

  }

  private getRandomTip(tips: string[]) {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
  }

  enableClippy() {
    this.clippyEnabled.next(true);
  }

  disableClippy() {
    this.clippyEnabled.next(false);
  }
}
