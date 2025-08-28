import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TextSearchModel, TextSearchOperation} from '../../models/text-search.model';
import {SearchService} from '../../services/search-service';

@Component({
  selector: 'app-find-replace-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './find-replace-dialog.component.html',
  styleUrls: ['./find-replace-dialog.component.scss']
})
export class FindReplaceDialogComponent {

  @Input() mode: 'find' | 'replace' = 'find';
  @Input() correlationId: string = '';
  @Input() windowClose: () => void = () => {
  };


  @ViewChild('findInput') findInput!: ElementRef;


  constructor(private searchService: SearchService) {
  }

  //Dialog Method Properties
  findText = '';
  replaceText = '';
  matchCase = false;
  wholeWord = false;

  onFind() {
    if (!this.findText.trim()) return;
    this.searchService.requestTextSearch(this.buildSearchModel(TextSearchOperation.Find));
  }

  onReplace() {
    if (!this.findText.trim()) return;
    this.searchService.requestTextSearch(this.buildSearchModel(TextSearchOperation.Replace));
  }

  onReplaceAll() {
    if (!this.findText.trim()) return;
    this.searchService.requestTextSearch(this.buildSearchModel(TextSearchOperation.ReplaceAll));
  }

  onCancel() {
    this.windowClose()
  }

  buildSearchModel(type: TextSearchOperation): TextSearchModel {
    return {
      correlationId: this.correlationId,
      operationType: type,
      findText: this.findText,
      replaceText: this.replaceText,
      matchCase: this.matchCase,
      wholeWord: this.wholeWord
    }
  }

}
