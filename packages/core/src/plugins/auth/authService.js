import Vue from 'vue';
import qs from "qs";
import { initService as authInitService } from '../../apis/auth';
import { initService as lowauthInitService } from '../../apis/lowauth';
import cookie from '../../utils/cookie';
import { getBasePath } from '../../utils/encodeUrl';

export const getBaseHeaders = () => {
    const headers = {
        Env: window.appInfo && window.appInfo.env,
    };
    if (cookie.get('authorization')) {
        headers.Authorization = cookie.get('authorization');
    }
    return headers;
};

export default {
  _map: undefined,
  authService: undefined,
  lowauthInitService: undefined,
  start() {
    this.authService = authInitService();
    this.lowauthInitService = lowauthInitService();
    window.authService = this.authService;
  },
  getUserInfo() {
    let userInfoPromise = null;

    if (window.appInfo.hasUserCenter) {
      userInfoPromise = this.lowauthInitService.GetUser({
        headers: getBaseHeaders(),
        config: {
          noErrorTip: true,
        },
      });
    } else {
      userInfoPromise = this.authService.GetUser({
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
        const $global = Vue.prototype.$global || {};
        const frontendVariables =
          Vue.prototype.$global.frontendVariables || {};
        frontendVariables.userInfo = userInfo;
        $global.userInfo = userInfo;
        return userInfo;
      })
      .catch((e) => {
        console.error("Failed to obtain user information", e)
        throw e;
      });
    
    return userInfoPromise;
  },
  getUserResources(DomainName) {
    let userResourcesPromise = null;
    if (window.appInfo.hasAuth) {
      userResourcesPromise = this.lowauthInitService
        .GetUserResources({
          headers: getBaseHeaders(),
          query: {
            // userId: Vue.prototype.$global.userInfo.UserId,
            // userName: Vue.prototype.$global.userInfo.UserName,
          },
          config: {
            noErrorTip: true,
          },
        })
        .then((result) => {
          let resources = [];
          //Initialize permission items
          this._map = new Map();
          if (Array.isArray(result)) {
            resources = result.filter(
              (resource) => resource?.resourceType === "ui"
            );
            resources.forEach((resource) =>
              this._map.set(resource.resourceValue, resource)
            );
          }
          return resources;
        });
    } else {
      // This is a non-sinking application. It calls the interface of Nuims. You need to pay great attention to the capitalization of the Resource here. When developing, you need to pay attention to whether the relevant test cases are covered.
      userResourcesPromise = this.authService
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
          this._map = new Map();
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
            this._map.set(resource?.ResourceValue, resource)
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
      const res = await this.lowauthInitService.getAppLoginTypes({
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
      const res = await this.authService.getNuimsTenantLoginTypes({
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
        return this.lowauthInitService
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
        return this.authService
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
    return this.authService.LoginH5({
      headers: getBaseHeaders(),
      ...data,
    });
  },
  getNuims(query) {
    return this.authService.GetNuims({
      headers: getBaseHeaders(),
      query,
    });
  },
  getConfig() {
    return this.authService.GetConfig({
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
    return !!this._map;
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
    return (this._map && this._map.has(authPath)) || false;
  },
};

export const runAhead = function (domainName) {
    authInitService().init(domainName);
};