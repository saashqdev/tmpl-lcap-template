import authService from "./authService";
import type { NASLUserInfo } from './authService';
import Global from "../../global";

function initAuth(options: {
  allowList?: string[];
  router?: any;
  base?: string;
} = {}) {
  authService.start();
  options.allowList = options.allowList || [];
  const router = options.router;
  const base = (options.base || "").replace(/\/$/, "");
  /**
   * Whether there are sub-permissions under the current route
   * This method can only be called in Global
   * @param {*} subPath sub-permission path, such as /createButton/enabled
   */
  authService.hasSub = function (subPath) {
    const currentPath = base + router.currentRoute.path;
    if (subPath[0] !== "/") subPath = "/" + subPath;
    return this.has(currentPath + subPath);
  };
  authService.hasFullPath = function (path) {
    if (path[0] !== "/") path = "/" + path;
    return this.has(base + path);
  };

  /**
   * Account and permission center
   */
  window.$auth = authService;
  Global.prototype.$auth = authService;

  return {
    auth: authService,
  }
}

export { 
  initAuth,
  authService,
};

export type {
  NASLUserInfo
}