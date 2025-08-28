import {Component, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {ClippyIntelligenceService} from '../../services/clippy-intelligence.service';

@Component({
  selector: 'app-win98-help',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './win98-help.component.html',
  styleUrls: ['./win98-help.component.scss']
})
export class Win98HelpComponent implements OnInit {

  clippyEnabled = false;

  constructor(private clippyIntelligenceService: ClippyIntelligenceService) {
    this.clippyIntelligenceService.clippyEnabled$.subscribe(enabled => this.clippyEnabled = enabled);
  }

  title = 'Windows 98 Help';

  // Help topics
  helpTopics = [
    {
      id: 'notepad',
      title: 'Notepad',
      icon: '📝',
      content: `
        <p>Notepad is a basic text editor included in Windows 98.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Type or paste text into the main area</li>
          <li>Use the File menu to create, open, save, or print documents</li>
          <li>Use the Edit menu for cut, copy, paste, and find operations</li>
          <li>Press Ctrl+S to save your document</li>
          <li>Press Ctrl+F to find text in your document</li>
        </ul>
      `
    },
    {
      id: 'paint',
      title: 'Paint',
      icon: '🎨',
      content: `
        <p>Paint is a simple graphics editor for creating and editing images.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Select a tool from the toolbox (pencil, eraser, etc.)</li>
          <li>Choose a color from the color palette</li>
          <li>Adjust the line width if needed</li>
          <li>Click and drag on the canvas to draw</li>
          <li>Use the File menu to save or print your image</li>
        </ul>
      `
    },
    {
      id: 'browser',
      title: 'Internet Explorer',
      icon: '🌐',
      content: `
        <p>Internet Explorer is a web browser for navigating the internet.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Type a web address in the address bar and press Enter</li>
          <li>Use the Back and Forward buttons to navigate through pages</li>
          <li>Click the Home button to go to your homepage</li>
          <li>Use bookmarks to save frequently visited sites</li>
          <li>Use the File menu to save web pages</li>
        </ul>
      `
    },
    {
      id: 'pdf-viewer',
      title: 'PDF Viewer',
      icon: '📕',
      content: `
        <p>The PDF Viewer allows you to view PDF documents.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Open a PDF file using the File menu</li>
          <li>Use the navigation buttons to move between pages</li>
          <li>Adjust the zoom level for better readability</li>
          <li>Use the search function to find text in the PDF</li>
          <li>Print the PDF using the File menu</li>
        </ul>
      `
    },
    {
      id: 'image-viewer',
      title: 'Image Viewer',
      icon: '🖼️',
      content: `
        <p>The Image Viewer allows you to view and edit images.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Open an image file using the File menu</li>
          <li>Use the zoom controls to adjust the image size</li>
          <li>Rotate the image using the rotation buttons</li>
          <li>Save the image using the File menu</li>
          <li>Print the image using the File menu</li>
        </ul>
      `
    },
    {
      id: 'settings',
      title: 'Display Settings',
      icon: '⚙️',
      content: `
        <p>Display Settings allows you to customize your desktop appearance.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Select a wallpaper from the list or browse for your own</li>
          <li>Choose a background color if no wallpaper is selected</li>
          <li>Adjust the wallpaper position (Center, Tile, or Stretch)</li>
          <li>Click Apply to see your changes</li>
          <li>Use the Screen Saver tab to configure screen saver settings</li>
        </ul>
      `
    },
    {
      id: 'search',
      title: 'Search',
      icon: '🔍',
      content: `
        <p>Search helps you find files and folders on your computer.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Enter a filename or part of a filename in the search box</li>
          <li>Optionally enter text that the file should contain</li>
          <li>Select where to search (specific drive or folder)</li>
          <li>Choose search options like case sensitivity</li>
          <li>Click "Search Now" to start the search</li>
        </ul>
      `
    },
    {
      id: 'my-computer',
      title: 'My Computer',
      icon: '💻',
      content: `
        <p>My Computer provides access to all drives and system folders.</p>
        <h4>How to use:</h4>
        <ul>
          <li>Double-click on a drive to view its contents</li>
          <li>Double-click on a system folder to open it</li>
          <li>Use the toolbar buttons for navigation</li>
          <li>Right-click on items to see more options</li>
          <li>Change the view using the View menu</li>
        </ul>
      `
    }
  ];

  selectedTopic = this.helpTopics[0];
  showClippy = false;

  clippyMessages = [
    "It looks like you're trying to use Windows 98. Have you read the help page?",
    "I see you're in the Help section. Is there something specific you're looking for?",
    "I can help you navigate through these help topics. Just let me know!",
    "Don't forget, you can add me to your desktop by clicking the 'Add To Desktop' button!"
  ];

  currentClippyMessage = '';

  ngOnInit(): void {
    this.selectTopic(this.helpTopics[0]);
    this.showRandomClippyMessage();
  }

  selectTopic(topic: any) {
    this.selectedTopic = topic;
  }

  toggleClippy() {
    this.showClippy = !this.showClippy;
    if (this.showClippy) {
      this.showRandomClippyMessage();
    }
  }

  showRandomClippyMessage() {
    const randomIndex = Math.floor(Math.random() * this.clippyMessages.length);
    this.currentClippyMessage = this.clippyMessages[randomIndex];
  }

  enableSystemClippy() {
    if (this.clippyEnabled) {
      this.clippyIntelligenceService.disableClippy();
    } else {
      this.clippyIntelligenceService.enableClippy();
    }
  }

  newClippyMessage() {
    this.showRandomClippyMessage();
  }
}
