export enum TextSearchOperation {
  Find = 'Find',
  Replace = 'Replace',
  ReplaceAll = "ReplaceAll",
}

export interface TextSearchModel {
  correlationId: string;
  operationType: TextSearchOperation
  findText: string;
  replaceText: string
  matchCase: boolean;
  wholeWord: boolean;
}



