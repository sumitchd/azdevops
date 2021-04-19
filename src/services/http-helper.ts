import {
  IAuthClient,
  IHttpClient,
  IHttpHeader,
} from "../models/core-services.model";
import axios from "axios";

export class HttpClient implements IHttpClient {
  private readonly authClient: IAuthClient;

  constructor(authClient: IAuthClient) {
    this.authClient = authClient;
  }
  public async Get<T>(
    url: string,
    resourceId: string,
    headers: IHttpHeader = {}
  ) {
    return axios.get<T>(url, {
      headers: await this.AppendAuthToken(headers || {}, resourceId),
    });
  }

  public async Post<T>(
    url: string,
    resourceId: string,
    body: any,
    headers: IHttpHeader = {}
  ) {
    return axios.post<T>(url, body, {
      headers: await this.AppendAuthToken(headers || {}, resourceId),
    });
  }

  public async Patch<T>(
    url: string,
    resourceId: string,
    body: any,
    headers: IHttpHeader = {}
  ) {
    headers["content-type"] = "application/json-patch+json";
    return axios.patch<T>(url, body, {
      headers: await this.AppendAuthToken(headers || {}, resourceId),
    });
  }

  private async AppendAuthToken(headers: IHttpHeader, resourceId: string) {
    try {
      const token = await this.authClient.acquireToken(resourceId);
      headers.Authorization = "bearer " + token;
    } catch {
      //log error in telemetry
    }
    return headers;
  }
}
