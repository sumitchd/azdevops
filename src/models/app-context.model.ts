import { ADALClient } from "../services/adal-client";
import { IHttpClient } from "./core-services.model";

export interface IAppContext {
  authClient: ADALClient;
  httpClient: IHttpClient;
}
