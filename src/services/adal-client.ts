import { Options } from "adal-angular";
import AuthenticationContext from "adal-angular";
import { IAuthClient, IUser } from "../models/core-services.model";

export class ADALClient implements IAuthClient {
  public authCtx: AuthenticationContext;

  public constructor(options: Options) {
    this.authCtx = new AuthenticationContext({
      cacheLocation: "localStorage",
      redirectUri: window.location.origin,
      ...options,
    });

    this.authCtx.handleWindowCallback();
  }
  authContext: unknown;

  public async login(): Promise<void> {
    return new Promise((resolve, reject): void => {
      try {
        this.authCtx.login();
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public async logOut(): Promise<void> {
    return new Promise((resolve, reject): void => {
      try {
        this.authCtx.logOut();
        resolve();
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public async getUser(): Promise<IUser | null> {
    return new Promise((resolve, reject): void => {
      try {
        const user = this.authCtx.getCachedUser();
        if (!user) return resolve(null);

        resolve({
          id: user.userName,
          email: user.userName,
          name: user.profile ? user.profile.name : "",
        });
      } catch (ex) {
        reject(ex);
      }
    });
  }

  public async getUserId(): Promise<string | null> {
    return new Promise(
      async (resolve, reject): Promise<void> => {
        try {
          const user = await this.getUser();

          resolve(user ? user.id : null);
        } catch (ex) {
          reject(ex);
        }
      }
    );
  }

  public async isLoggedIn(): Promise<boolean> {
    return new Promise(
      async (resolve, reject): Promise<void> => {
        try {
          resolve((await this.getUser()) !== null);
        } catch (ex) {
          reject(ex);
        }
      }
    );
  }

  public async acquireToken(resource: string): Promise<string | null> {
    return new Promise((resolve, reject): void => {
      this.authCtx.acquireToken(resource, (error, token): void => {
        if (error) {
          reject(error);
          return;
        }

        resolve(token);
      });
    });
  }
}
