import {Injectable} from '@angular/core';
import {DialogService} from './dialog.service';

export interface FindOptions {
  text: string;
  matchCase: boolean;
  wholeWord: boolean;
}

export interface ReplaceOptions {
  findText: string;
  replaceText: string;
  matchCase: boolean;
  wholeWord: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FindReplaceService {
  private lastFindText = '';
  private lastFindOptions: FindOptions = {
    text: '',
    matchCase: false,
    wholeWord: false
  };
  private lastFindPosition = -1;

  constructor(private dialogService: DialogService) {
  }

  find(
    content: string,
    options: FindOptions,
    findNext: boolean = false,
    selectCallback: (start: number, end: number) => void
  ): boolean {
    // Store the find options
    this.lastFindText = options.text;
    this.lastFindOptions = options;

    // Determine search starting position
    let startPos = findNext ? this.lastFindPosition + 1 : 0;

    // If we've reached the end, start from the beginning
    if (startPos >= content.length) {
      startPos = 0;
    }

    // Build search string based on options
    let searchText = options.matchCase ? options.text : options.text.toLowerCase();
    let searchContent = options.matchCase ? content : content.toLowerCase();

    // Find the text
    let index = -1;

    if (options.wholeWord) {
      // For whole word matching, we need to check word boundaries
      const words = searchContent.split(/\b/);
      let currentPos = 0;

      for (let i = 0; i < words.length; i++) {
        if (words[i] === searchText && currentPos >= startPos) {
          index = currentPos;
          break;
        }
        currentPos += words[i].length;
      }
    } else {
      // Simple substring search
      index = searchContent.indexOf(searchText, startPos);
    }

    if (index !== -1) {
      // Found the text, select it
      selectCallback(index, index + options.text.length);
      this.lastFindPosition = index;
      return true;
    } else {
      // Not found, show message
      this.dialogService.showError(
        'Notepad',
        `Cannot find "${options.text}"`
      );
      this.lastFindPosition = -1;
      return false;
    }
  }

  replace(
    content: string,
    options: ReplaceOptions,
    selectedText: string,
    selectionStart: number,
    selectionEnd: number,
    replaceCallback: (newContent: string, newStart: number, newEnd: number) => void
  ): void {
    // Check if selected text matches what we're looking for
    const searchText = options.matchCase ? options.findText : options.findText.toLowerCase();
    const isSelectedMatch = options.matchCase
      ? selectedText === searchText
      : selectedText.toLowerCase() === searchText;

    if (isSelectedMatch) {
      // Replace the selected text
      const newContent = content.substring(0, selectionStart) + options.replaceText + content.substring(selectionEnd);
      const newStart = selectionStart;
      const newEnd = selectionStart + options.replaceText.length;
      replaceCallback(newContent, newStart, newEnd);
    } else {
      // Find the next occurrence
      this.lastFindText = options.findText;
      this.lastFindOptions = {
        text: options.findText,
        matchCase: options.matchCase,
        wholeWord: options.wholeWord
      };

      this.find(content, this.lastFindOptions, false, (start, end) => {
        replaceCallback(content, start, end);
      });
    }
  }

  replaceAll(
    content: string,
    options: ReplaceOptions,
    replaceCallback: (newContent: string) => void
  ): void {
    let findText = options.findText;
    let replaceText = options.replaceText;

    // Build regex based on options
    let flags = 'g';
    if (!options.matchCase) {
      flags += 'i';
    }

    let pattern;
    if (options.wholeWord) {
      // Use word boundaries for whole word matching
      pattern = new RegExp('\\b' + this.escapeRegExp(findText) + '\\b', flags);
    } else {
      pattern = new RegExp(this.escapeRegExp(findText), flags);
    }

    // Replace all occurrences
    const count = (content.match(pattern) || []).length;
    const newContent = content.replace(pattern, replaceText);

    // Update the content if changes were made
    if (newContent !== content) {
      replaceCallback(newContent);
    }

    // Show result message
    this.dialogService.showInformation(
      'Replace All',
      `Replaced ${count} occurrences`
    );
  }

  private escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
}
