import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { AppContext } from "./services/app-context";
import { ADALClient } from "./services/adal-client";
import { HttpClient } from "./services/http-helper";

const authClient = new ADALClient({
  clientId: process.env.REACT_APP_CLIENT_ID!,
  redirectUri: `${window.location.origin}/auth.html`,
});
const httpClient = new HttpClient(authClient);
ReactDOM.render(
  <React.StrictMode>
    <AppContext.Provider
      value={{ authClient: authClient, httpClient: httpClient }}
    >
      <App />
    </AppContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);
