import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {DialogService} from '../../services/dialog.service';
import {ToolbarBuilder} from '../../utils/toolbar-builder';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {take} from 'rxjs';
import {TrimPipe} from '../../pipes/trim-pipe';

@Component({
  selector: 'app-win98-browser',
  standalone: true,
  imports: [CommonModule, FormsModule, Win98ToolbarComponent, TrimPipe],
  templateUrl: './win98-browser.component.html',
  styleUrls: ['./win98-browser.component.scss']
})
export class Win98BrowserComponent implements AfterViewInit {
  @ViewChild('browserFrame') browserFrame!: ElementRef;
  @Input() windowClose: () => void = () => {
  };


  constructor(private dialogService: DialogService) {
  }

  // Browser state
  private homeURL = 'https://web.archive.org/web/1998/https://www.google.com/';
  url: string = this.homeURL;
  isLoading: boolean = false;
  pageTitle: string = 'Internet Explorer';
  canGoBack: boolean = false;
  canGoForward: boolean = false;

  // Windows 98 style properties
  history: string[] = [];
  historyIndex: number = -1;

  // Bookmarks
  bookmarks = [
    {name: 'My Github', url: 'https://web.archive.org/web/20250811203206/https://github.com/MohammedBayatena/'},
    {name: 'Csoon Magazine', url: 'https://www.csoon.com/'},
    {name: 'The Old Net', url: 'https://theoldnet.com/'},
    {name: 'Brahkie', url: 'https://brahkie.neocities.org/'},
    {name: 'WPlace', url: 'https://wplace.live'},
  ];

  // Toolbar model

  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => this.handleOpen()})
    .AddDropDownItem({id: 'save', label: 'Save As...', shortcut: 'Ctrl+S', action: () => this.handleSaveAs()})
    .AddDivider()
    .AddDropDownItem({id: 'print', label: 'Print...', shortcut: 'Ctrl+P', action: () => this.handlePrint()})
    .AddDivider()
    .AddDropDownItem({id: 'close', label: 'Close', action: () => this.handleClose()})
    .AddDropdown('view', 'View')
    .AddDropDownItem({id: 'stop', label: 'Stop', shortcut: 'Esc', action: () => this.handleStop()})
    .AddDropDownItem({id: 'refresh', label: 'Refresh', shortcut: 'F5', action: () => this.handleRefresh()})
    .AddDropdown('favorites', 'Favorites')
    .AddDropDownItem({id: 'addToFavorites', label: 'Add to Favorites...', action: () => this.handleAddToFavorites()})
    .AddDropDownItem({id: 'clearFavorites', label: 'Clear Favorites...', action: () => this.handleClearFavorites()})
    .AddDropdown('help', 'Help')
    .AddDropDownItem({
      id: 'aboutInternetExplorer', label: 'About Internet Explorer', action: () => this.handleAboutInternetExplorer()
    })
    .GetToolbar()

  ngAfterViewInit() {
    this.loadUrl();
  }

  loadUrl() {
    if (!this.url) return;

    // Add http:// if no protocol is specified
    if (!this.url.startsWith('http://') && !this.url.startsWith('https://') && !this.url.startsWith('blob:')) {
      this.url = 'https://' + this.url;
    }

    this.isLoading = true;

    // Update history
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(this.url);
    this.historyIndex = this.history.length - 1;

    // Update navigation state
    this.updateNavigationState();

    // Load the URL in iframe
    if (this.browserFrame) {
      this.browserFrame.nativeElement.onload = () => {
        this.isLoading = false;
        try {
          this.pageTitle = this.browserFrame.nativeElement.contentWindow.document.title || 'Internet Explorer';
        } catch (e) {
          // Cross-origin error, use a default title
          this.pageTitle = 'Internet Explorer';
        }
      };

      this.browserFrame.nativeElement.onerror = () => {
        this.isLoading = false;
        this.pageTitle = 'Error loading page';
      };

      this.browserFrame.nativeElement.src = this.url;
    }
  }

  goBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.url = this.history[this.historyIndex];
      this.loadUrl();
    }
  }

  goForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.url = this.history[this.historyIndex];
      this.loadUrl();
    }
  }

  refreshPage() {
    if (this.browserFrame) {
      this.isLoading = true;
      this.browserFrame.nativeElement.src = this.url;
    }
  }

  stopLoading() {
    if (this.browserFrame) {
      this.browserFrame.nativeElement.src = '';
      this.isLoading = false;
    }
  }

  goHome() {
    this.url = this.homeURL;
    this.loadUrl();
  }

  updateNavigationState() {
    this.canGoBack = this.historyIndex > 0;
    this.canGoForward = this.historyIndex < this.history.length - 1;
  }

  onUrlSubmit() {
    this.loadUrl();
  }

  navigateToBookmark(bookmarkUrl: string
  ) {
    this.url = bookmarkUrl;
    this.loadUrl();
  }

  // Toolbar action implementations
  private handleOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.html,.htm';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          // Create a blob URL for the file
          const blob = new Blob([e.target?.result as string], {type: 'text/html'});

          // Navigate to the local file
          this.url = URL.createObjectURL(blob);
          this.loadUrl();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  private handleSaveAs() {
    if (this.browserFrame && this.browserFrame.nativeElement.contentWindow) {
      try {
        // Get the page content
        const documentContent = this.browserFrame.nativeElement.contentWindow.document.documentElement.outerHTML;

        // Create a blob with the content
        const blob = new Blob([documentContent], {type: 'text/html'});

        // Create a download link
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'webpage.html';

        // Trigger the download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        URL.revokeObjectURL(link.href);
      } catch (e) {
        this.dialogService.showError(
          'Internet Explorer',
          'Cannot save page due to cross-origin restrictions'
        );
      }
    }
  }

  private handlePrint() {
    if (this.browserFrame && this.browserFrame.nativeElement.contentWindow) {
      try {
        this.browserFrame.nativeElement.contentWindow.print();
      } catch (e) {
        this.dialogService.showError(
          'Internet Explorer',
          'Cannot print due to cross-origin restrictions'
        );
      }
    }
  }

  private handleClose() {
    this.windowClose();
  }

  private handleStop() {
    this.stopLoading();
  }

  private handleRefresh() {
    this.refreshPage();
  }

  private handleAddToFavorites() {
    // Get the current page title
    let title = this.pageTitle;
    if (title === 'Internet Explorer') {
      title = prompt('Enter a name for this favorite:', this.url)!;
      if (!title) return;
    }

    // Add to bookmarks
    this.bookmarks.push({name: title, url: this.url});

    alert(`"${title}" has been added to your favorites.`);
  }

  private handleClearFavorites() {
    this.dialogService.showConfirmation(
      'Internet Explorer',
      'Clear Favourites? All Favorite Pages Will Be Cleared!',
      'Yes',
      'No'
    )
      .pipe(take(1))
      .subscribe(result => {
        if (result.confirmed) {
          this.bookmarks = [];
        }
      });
  }

  private handleAboutInternetExplorer() {
    this.dialogService.showInformation(
      'About Internet Explorer',
      'Internet Explorer\n\nVersion 6.0\n\n© 1998 Microsoft Corporation'
    );
  }

}
