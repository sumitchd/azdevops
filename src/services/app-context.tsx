import React from "react";
import { IAppContext } from "../models/app-context.model";
import { ADALClient } from "./adal-client";
import { HttpClient } from "./http-helper";

const authClient = new ADALClient({
  clientId: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: `${window.location.origin}/auth.html`,
});
const httpClient = new HttpClient(authClient);

export const AppContext = React.createContext({} as IAppContext);
