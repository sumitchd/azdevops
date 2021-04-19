import { AxiosResponse } from "axios";

export interface IAuthClient {
  readonly authContext: unknown;
  login(loginOptions?: ILoginOptions): Promise<void>;
  logOut(): Promise<void>;
  getUser(): Promise<IUser | null>;
  getUserId(): Promise<string | null>;
  isLoggedIn(): Promise<boolean>;
  acquireToken(resourceOrScopes: string | string[]): Promise<string | null>;
}
export interface ILoginOptions {
  scopes?: string[];
}
export interface IUser {
  id: string;
  email: string;
  name: string;
  oid?: string;
}

export interface IHttpHeader {
  [key: string]: string;
}

export interface IHttpClient {
  Get<T>(
    url: string,
    resourceId: string,
    headers?: IHttpHeader
  ): Promise<AxiosResponse<T>>;
  Post<T>(
    url: string,
    resourceId: string,
    body: any,
    headers?: IHttpHeader
  ): Promise<AxiosResponse<T>>;
  Patch<T>(
    url: string,
    resourceId: string,
    body: any,
    headers?: IHttpHeader
  ): Promise<AxiosResponse<T>>;
}
