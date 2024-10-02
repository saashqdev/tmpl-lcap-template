import qs from "qs";

import { initAuthService, initLowauthService } from '../../apis';
import { getBasePath, cookie  } from '../../utils';
import Global from '../../global';

export const getBaseHeaders = () => {
    type Headers = {
        Env: string;
        Authorization?: string;
    }
    const headers: Headers = {
        Env: window.appInfo && window.appInfo.env,
    };
    if (cookie.get('authorization')) {
        headers.Authorization = cookie.get('authorization');
    }
    return headers;
};

let userInfoPromise = null;
let userResourcesPromise = null;

// FIXME replaced with real type
export type NASLUserInfo = { 
  UserName: string;
  UserId: string;
};

export interface IService {
  start: () => void;
  getUserInfo: () => Promise<NASLUserInfo | undefined>;
  getUserResources: (DomainName: string) => Promise<any>;
  getKeycloakLogoutUrl: () => Promise<string>;
  logout: () => Promise<any>;
  loginH5: (data: any) => Promise<any>;
  getNuims: (query: any) => Promise<any>;
  getConfig: () => Promise<any>;
  parse: (query: string) => any;
  stringify: (query: any) => string;
  isInit: () => boolean;
  init: (domainName: string) => Promise<any>;
  has: (authPath: string) => boolean;
  hasSub?: (subPath: string) => boolean;
  hasFullPath?: (path: string) => boolean;
}

let _map;
let authService;
let lowauthService;

const Service: IService = {
  start() {
    authService = initAuthService();
    lowauthService = initLowauthService();
    window.authService = authService;
  },
  getUserInfo() {
    if (!userInfoPromise) {
      if (window.appInfo.hasUserCenter) {
        userInfoPromise = lowauthService.GetUser({
          headers: getBaseHeaders(),
          config: {
            noErrorTip: true,
          },
        });
      } else {
        userInfoPromise = authService.GetUser({
          headers: getBaseHeaders(),
          config: {
            noErrorTip: true,
          },
        });
      }
      userInfoPromise = userInfoPromise
        .then((result) => {
          const userInfo = result?.Data;
          if (!userInfo?.UserId && userInfo?.userId) {
            userInfo.UserId = userInfo.userId;
            userInfo.UserName = userInfo.userName;
          }

          const $global = Global.prototype.$global || {};
          const frontendVariables = $global.frontendVariables || {};
          frontendVariables.userInfo = userInfo;
          $global.userInfo = userInfo;

          return userInfo;
        })
        .catch((e) => {
          userInfoPromise = null;
          throw e;
        });
    }
    return userInfoPromise;
  },
  getUserResources(DomainName) {
    if (window.appInfo.hasAuth) {
      userResourcesPromise = lowauthService
        .GetUserResources({
          headers: getBaseHeaders(),
          query: {
          },
          config: {
            noErrorTip: true,
          },
        })
        .then((result) => {
          let resources = [];
          // Initialize permission items
          _map = new Map();
          if (Array.isArray(result)) {
            resources = result.filter(
              (resource) => resource?.resourceType === "ui"
            );
            resources.forEach((resource) =>
              _map.set(resource.resourceValue, resource)
            );
          }
          return resources;
        });
    } else {
      // This is a non-sinking application. It calls the interface of Nuims. You need to pay great attention to the capitalization of the Resource here. When developing, you need to pay attention to whether the relevant test cases are covered.
      userResourcesPromise = authService
        .GetUserResources({
          headers: getBaseHeaders(),
          query: {
            DomainName,
          },
          config: {
            noErrorTip: true,
          },
        })
        .then((res) => {
          _map = new Map();
          const resources = res.Data.items.reduce(
            (acc, { ResourceType, ResourceValue, ...item }) => {
              if (ResourceType === "ui") {
                acc.push({
                  ...item,
                  ResourceType,
                  ResourceValue,
                  resourceType: ResourceType,
                  resourceValue: ResourceValue,
                }); // Compatible with uppercase and lowercase writing, retain uppercase to avoid affecting other hidden logic
              }
              return acc;
            },
            []
          );
          // Initialize permission items
          resources.forEach((resource) =>
            _map.set(resource?.ResourceValue, resource)
          );
          return resources;
        });
    }
    return userResourcesPromise;
  },
  async getKeycloakLogoutUrl() {
    let logoutUrl = "";
    const basePath = getBasePath();
    if (window.appInfo.hasUserCenter) {
      const res = await lowauthService.getAppLoginTypes({
        query: {
          Action: "GetTenantLoginTypes",
          Version: "2024-06-01",
          TenantName: window.appInfo.tenant,
        },
      });
      const KeycloakConfig = res?.Data.Keycloak;
      if (KeycloakConfig) {
        logoutUrl = `${KeycloakConfig?.config?.logoutUrl}?redirect_uri=${window.location.protocol}//${window.location.host}${basePath}/login`;
      }
    } else {
      const res = await authService.getNuimsTenantLoginTypes({
        query: {
          Action: "GetTenantLoginTypes",
          Version: "2024-06-01",
          TenantName: window.appInfo.tenant,
        },
      });
      const KeycloakConfig = res?.Data.find(
        (item) => item.LoginType === "Keycloak"
      );
      if (KeycloakConfig) {
        logoutUrl = `${KeycloakConfig?.extendProperties?.logoutUrl}?redirect_uri=${window.location.protocol}//${window.location.host}${basePath}/login`;
      }
    }

    return logoutUrl;
  },
  async logout() {
    const sleep = (t) => new Promise((r) => setTimeout(r, t));

    if (window.appInfo.hasUserCenter) {
      const logoutUrl = await this.getKeycloakLogoutUrl();
      localStorage.setItem("logoutUrl", logoutUrl);
      if (logoutUrl) {
        window.location.href = logoutUrl;
        await sleep(1000);
      } else {
        return lowauthService
          .Logout({
            headers: getBaseHeaders(),
          })
          .then(() => {
            // User center, remove authentication and username information
            cookie.erase("authorization");
            cookie.erase("username");
          });
      }
    } else {
      const logoutUrl = await this.getKeycloakLogoutUrl();
      localStorage.setItem("logoutUrl", logoutUrl);
      if (logoutUrl) {
        window.location.href = logoutUrl;
        await sleep(1000);
      } else {
        return authService
          .Logout({
            headers: getBaseHeaders(),
          })
          .then(() => {
            cookie.erase("authorization");
            cookie.erase("username");
          });
      }
    }
  },
  loginH5(data) {
    return authService.LoginH5({
      headers: getBaseHeaders(),
      ...data,
    });
  },
  getNuims(query) {
    return authService.GetNuims({
      headers: getBaseHeaders(),
      query,
    });
  },
  getConfig() {
    return authService.GetConfig({
      headers: getBaseHeaders(),
    });
  },
  // Process parameter conversion of data
  parse: qs.parse,
  stringify: qs.stringify,
  /**
   * Whether the permission service is initialized
   */
  isInit() {
    return !!_map;
  },
  /**
   * Initialize permission service
   */
  init(domainName) {
    return this.getUserInfo().then(() => this.getUserResources(domainName));
  },
  /**
   * Whether you have permission
   * @param {*} authPath permission path, such as /dashboard/entity/list
   */
  has(authPath) {
    return (_map && _map.has(authPath)) || false;
  },
};

export default Service;
