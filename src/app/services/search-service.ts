import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {TextSearchModel, TextSearchOperation} from '../models/text-search.model';
import {FindReplaceDialogComponent} from '../components/find-replace-dialog.component/find-replace-dialog.component';
import {DialogType} from '../models/dialog.model';
import {DialogService} from './dialog.service';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(
    private dialogService: DialogService,
  ) {
  }


  private textSearchValue: BehaviorSubject<TextSearchModel> = new BehaviorSubject<TextSearchModel>({
    operationType: TextSearchOperation.Find,
    findText: '',
    replaceText: '',
    matchCase: false,
    wholeWord: false,
    correlationId: ''
  });

  textSearchValue$ = this.textSearchValue.asObservable()

  openTextSearchDialog(mode: 'find' | 'replace', instanceTitle: string, correlationId: string) {
    this.dialogService.open({
      id: `${correlationId}`,
      title: `${instanceTitle} - ${mode == 'find' ? 'Find' : 'Find and Replace'}`,
      contentComponent: FindReplaceDialogComponent,
      contentInputs: {
        mode: mode,
        correlationId: correlationId,
        windowClose: () => this.dialogService.close(correlationId)
      },
      x: 100,
      y: 100,
      width: 400,
      height: 400,
      zIndex: 200,
      type: DialogType.FIND
    });
  }

  requestTextSearch(searchModel: TextSearchModel): void {
    this.textSearchValue.next(searchModel);
  }


}
