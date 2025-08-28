import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {Win98ToolbarComponent} from '../win98-window-toolbar.component.ts/win98-window-toolbar.component';
import {ToolbarModel} from '../../models/window-toolbar.model';
import {DialogService} from '../../services/dialog.service';
import {FindOptions, FindReplaceService, ReplaceOptions} from '../../services/find-replace.service';
import {SearchService} from '../../services/search-service';
import {TextSearchOperation} from '../../models/text-search.model';
import {filter, take} from 'rxjs';
import {FileConverterDownloaderHelper} from '../../utils/file-converter-downloader.service';
import {ToolbarBuilder} from '../../utils/toolbar-builder';

@Component({
  selector: 'app-win98-notepad',
  standalone: true,
  imports: [CommonModule, FormsModule, Win98ToolbarComponent],
  templateUrl: './win98-notepad.component.html',
  styleUrls: ['./win98-notepad.component.scss']
})
export class Win98NotepadComponent implements AfterViewInit {
  @ViewChild('textarea') textarea!: ElementRef<HTMLTextAreaElement>;

  // Notepad content
  content: string = '';
  correlationId: string;

  // Notepad settings
  @Input() wordWrap: boolean = true;
  @Input() statusBar: boolean = true;
  @Input() title: string = 'Untitled - Notepad';
  @Input() windowClose: () => void = () => {
  };

  // Toolbar model
  toolbarModel: ToolbarModel = new ToolbarBuilder()
    .AddDropdown('file', 'File')
    .AddDropDownItem({id: 'new', label: 'New', shortcut: 'Ctrl+N', action: () => this.handleNew()})
    .AddDropDownItem({id: 'open', label: 'Open...', shortcut: 'Ctrl+O', action: () => this.handleOpen()})
    .AddDropDownItem({id: 'save', label: 'Save', shortcut: 'Ctrl+S', action: () => this.handleSave()})
    .AddDropDownItem({id: 'saveAs', label: 'Save As...', action: () => this.handleSaveAs()})
    .AddDivider()
    .AddDropDownItem({id: 'print', label: 'Print...', shortcut: 'Ctrl+P', action: () => this.handlePrint()})
    .AddDivider()
    .AddDropDownItem({id: 'exit', label: 'Exit', action: () => this.handleExit()})
    .AddDropdown('edit', 'Edit')
    .AddDropDownItem({id: 'undo', label: 'Undo', shortcut: 'Ctrl+Z', action: () => this.handleUndo()})
    .AddDivider()
    .AddDropDownItem({id: 'cut', label: 'Cut', shortcut: 'Ctrl+X', action: () => this.handleCut()})
    .AddDropDownItem({id: 'copy', label: 'Copy', shortcut: 'Ctrl+C', action: () => this.handleCopy()})
    .AddDropDownItem({id: 'paste', label: 'Paste', shortcut: 'Ctrl+V', action: () => this.handlePaste()})
    .AddDropDownItem({id: 'delete', label: 'Delete', shortcut: 'Del', action: () => this.handleDelete()})
    .AddDivider()
    .AddDropDownItem({id: 'selectAll', label: 'Select All', shortcut: 'Ctrl+A', action: () => this.handleSelectAll()})
    .AddDropDownItem({id: 'timeDate', label: 'Time/Date', shortcut: 'F5', action: () => this.handleTimeDate()})
    .AddDropdown('search', 'Search')
    .AddDropDownItem({id: 'find', label: 'Find...', shortcut: 'Ctrl+F', action: () => this.handleFind()})
    .AddDropDownItem({id: 'replace', label: 'Replace...', shortcut: 'Ctrl+H', action: () => this.handleReplace()})
    .AddDropdown('help', 'Help')
    .AddDropDownItem({id: 'helpTopics', label: 'Help Topics', shortcut: 'F1', action: () => this.handleHelpTopics()})
    .AddDivider()
    .AddDropDownItem({id: 'about', label: 'About Notepad', action: () => this.handleAbout()})
    .GetToolbar()

  // Internal state
  private history: string[] = [''];
  private historyIndex: number = 0;


  constructor(
    private searchService: SearchService,
    private dialogService: DialogService,
    private findReplaceService: FindReplaceService
  ) {
    this.correlationId = Math.random().toString(20)
  }

  ngAfterViewInit() {
    this.updateTextarea();

    //Only Process Events Coming Into This Notepad  Instance
    this.searchService.textSearchValue$.pipe(
      filter(x => x.correlationId == this.correlationId),
    )
      .subscribe(textSearchValue => {
        switch (textSearchValue.operationType) {
          case TextSearchOperation.Find:
            this.onFind({
              text: textSearchValue.findText,
              wholeWord: textSearchValue.wholeWord,
              matchCase: textSearchValue.matchCase,
            });
            break;
          case TextSearchOperation.Replace:
            this.onReplace({
              findText: textSearchValue.findText,
              replaceText: textSearchValue.replaceText,
              wholeWord: textSearchValue.wholeWord,
              matchCase: textSearchValue.matchCase
            });
            break;
          case TextSearchOperation.ReplaceAll:
            this.onReplaceAll({
              findText: textSearchValue.findText,
              replaceText: textSearchValue.replaceText,
              wholeWord: textSearchValue.wholeWord,
              matchCase: textSearchValue.matchCase
            });
            break;
        }
      })
  }

  private updateTextarea() {
    if (this.textarea) {
      this.textarea.nativeElement.value = this.content;
    }
  }

  onContentChange() {
    if (this.textarea) {
      this.content = this.textarea.nativeElement.value;
      this.saveToHistory();
    }
  }

  private saveToHistory() {
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }
    this.history.push(this.content);
    this.historyIndex = this.history.length - 1;
  }

  // File menu actions
  handleNew() {
    if (this.content && this.content.trim() !== '') {
      this.dialogService.showConfirmation(
        'Notepad',
        'Do you want to save changes?',
        'Yes',
        'No'
      )
        .pipe(take(1))
        .subscribe(result => {
          if (result.confirmed) {
            this.handleSave();
          }
          this.content = '';
          this.updateTextarea();
        });
    } else {
      this.content = '';
      this.updateTextarea();
    }
  }

  handleOpen() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.content = e.target?.result as string;
          this.updateTextarea();
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  handleSave() {
    const blob = FileConverterDownloaderHelper.convertStringToTextBlob(this.content)
    FileConverterDownloaderHelper.downloadBlopAsFile(blob, 'Untitled.txt');
  }

  handleSaveAs() {
    this.handleSave();
  }

  handlePrint() {
    window.print();
  }

  handleExit() {
    if (this.content && this.content.trim() !== '') {
      this.dialogService.showConfirmation(
        'Notepad',
        'Do you want to save changes?',
        'Yes',
        'No'
      )
        .pipe(take(1))
        .subscribe(result => {
          if (result.confirmed) {
            this.handleSave();
          }
          this.windowClose();
        });
    } else {
      this.windowClose();
    }
  }

  // Edit menu actions
  handleUndo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.content = this.history[this.historyIndex];
      this.updateTextarea();
    }
  }

  handleCut() {
    if (this.textarea) {
      const textarea = this.textarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      if (selectedText) {
        navigator.clipboard.writeText(selectedText).then(() => {
          this.handleDelete()
          this.onContentChange();
        })
      }
    }
  }

  handleCopy() {
    if (this.textarea) {
      const textarea = this.textarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);

      if (selectedText) {
        navigator.clipboard.writeText(selectedText)
          .then(() => {
          })
      }
    }
  }

  handlePaste() {
    if (this.textarea) {
      navigator.clipboard.readText().then(text => {
        this.content = text;
        this.updateTextarea();
        this.onContentChange();
      })
    }
  }

  handleDelete() {
    if (this.textarea) {
      const textarea = this.textarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (start !== end) {
        textarea.value = textarea.value.substring(0, start) + textarea.value.substring(end);
        this.onContentChange();
      }
    }
  }

  handleFind() {
    this.searchService.openTextSearchDialog('find', 'New Document', this.correlationId)
  }

  handleReplace() {
    this.searchService.openTextSearchDialog('replace', 'New Document', this.correlationId)
  }

  // Find/Replace dialog handlers
  onFind(options: FindOptions) {
    this.performFind(options);
  }

  onReplace(options: ReplaceOptions) {
    if (!this.textarea) return;

    const textarea = this.textarea.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    this.findReplaceService.replace(
      this.content,
      options,
      selectedText,
      start,
      end,
      (newContent, newStart, newEnd) => {
        this.content = newContent;
        this.updateTextarea();
        textarea.setSelectionRange(newStart, newEnd);
      }
    );
  }

  onReplaceAll(options: ReplaceOptions) {
    this.findReplaceService.replaceAll(
      this.content,
      options,
      (newContent) => {
        this.content = newContent;
        this.updateTextarea();
      }
    );
  }

  handleSelectAll() {
    if (this.textarea) {
      this.textarea.nativeElement.select();
    }
  }

  handleTimeDate() {
    const now = new Date();
    const timeDate = now.toLocaleTimeString() + ' ' + now.toLocaleDateString();

    if (this.textarea) {
      const textarea = this.textarea.nativeElement;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      textarea.value = textarea.value.substring(0, start) + timeDate + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + timeDate.length;

      this.onContentChange();
    }
  }

  // Help menu actions
  handleHelpTopics() {
    this.dialogService.showInformation(
      'Help Topics',
      'Help Topics would open here'
    );
  }

  handleAbout() {
    this.dialogService.showInformation(
      'About Notepad',
      'Notepad\n\nVersion 1.0\n\n© 1998 Windows 98 Notepad'
    );
  }

  private performFind(options: FindOptions) {
    if (!this.textarea) return;

    this.findReplaceService.find(
      this.content,
      options,
      true,
      (start, end) => {
        const textarea = this.textarea.nativeElement;
        textarea.focus();
        textarea.setSelectionRange(start, end);
      }
    );
  }
}
