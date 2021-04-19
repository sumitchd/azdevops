export interface IWorkItemRelations {
  workItemRelations: Array<IWorkItemRelation>;
}

export interface IWorkItemsWithRelations {
  workItemRelations: Array<IWorkItemRelation>;
}

export interface IWorkItemRelation {
  target: IWIDetail;
  source: IWIDetail;
}

export interface IWIDetail {
  id: number;
  url: string;
}

export interface IWorkItemIds {
  count: number;
  value: Array<IValue>;
}

export interface IValue {
  id: number;
  fields: {
    "System.Title": string;
  };
  url: string;
}

export interface ITreeView {
  id: number;
  title: string;
  url: string;
  children: ITreeView[];
}

export interface IItem {
  id: number;
  title: string;
}
