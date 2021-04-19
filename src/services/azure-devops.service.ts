import {
  IWorkItemRelation,
  IValue,
  ITreeView,
  IWorkItemsWithRelations,
  IWorkItemIds,
} from "../models/app.model";
import { IHttpClient } from "../models/core-services.model";

export class AzureDevopsService {
  private readonly httpClient: IHttpClient;
  private readonly azDevOpsResourceId: string =
    "499b84ac-1321-427f-aa17-267ca6975798";
  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  public async GetWorkItemIDsAsync(orgName: string, projectName: string) {
    const wql = `SELECT
    [System.Id]
    FROM workitemLinks
    WHERE
    (
        [Source].[System.TeamProject] = '${projectName}'
        AND [Source].[System.WorkItemType] <> ''
        AND [Source].[System.State] <> ''
    )
    AND (
        [System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward'
    )
    AND (
        [Target].[System.TeamProject] = '${projectName}'
        AND [Target].[System.WorkItemType] <> ''
    )
    MODE (Recursive)`;
    const response = await this.httpClient.Post<IWorkItemsWithRelations>(
      `https://dev.azure.com/${orgName}/${projectName}/_apis/wit/wiql?api-version=4.1`,
      this.azDevOpsResourceId,
      { query: wql }
    );
    return response.data;
  }

  public async GetWorkItemDetailsByIdAsync(
    orgName: string,
    projectName: string,
    ids: string
  ) {
    const url = `https://dev.azure.com/${orgName}/${projectName}/_apis/wit/workitems?ids=${ids}&fields=System.Title&api-version=6.0`;
    const response = await this.httpClient.Get<IWorkItemIds>(
      url,
      this.azDevOpsResourceId
    );
    return response.data;
  }

  public async UpdateWorkItemFieldAsync(
    orgName: string,
    projectName: string,
    body: any,
    workItemId: number
  ) {
    const url = `https://dev.azure.com/${orgName}/${projectName}/_apis/wit/workitems/${workItemId}?api-version=4.1`;
    const response = await this.httpClient.Patch(
      url,
      this.azDevOpsResourceId,
      body
    );
    return response.status == 200;
  }

  public createHierarchy(
    itemsWithRelationsList: IWorkItemRelation[],
    itemDetailsList: IValue[]
  ) {
    const treeData: Array<ITreeView> = [];
    const idLookup = {};
    const nameLookup = {};
    // init idLookup with each array item.target.id as key and children as empty array;
    // init namelookup with each itemDetailsList's item.id as key and value as their title
    for (let i = 0; i < itemsWithRelationsList.length; i++) {
      let itemId = itemsWithRelationsList[i].target?.id;
      let itemDetail = itemDetailsList[i];
      idLookup[itemId] = itemDetailsList[i];
      idLookup[itemId].children = [];
      nameLookup[itemDetail.id] = itemDetail.fields["System.Title"];
    }

    //loop upon the relations list and if source = null ? then it's a prent level item and can be directly pushed into treeData
    // else push the item into children array
    itemsWithRelationsList.forEach((item) => {
      if (item.source !== null) {
        idLookup[item.source.id].children.push({
          id: item.target.id,
          title: nameLookup[item.target.id],
          url: item.target.url,
          children: idLookup[item.target.id].children,
        });
      } else {
        treeData.push({
          id: item.target.id,
          title: nameLookup[item.target.id],
          url: item.target.url,
          children: idLookup[item.target.id].children,
        });
      }
    });
    return treeData;
  }
}
