import React from "react";
import { IAppContext } from "../models/app-context.model";

export const AppContext = React.createContext({} as IAppContext);
export const AppWithCoreServices = AppContext.Provider;
