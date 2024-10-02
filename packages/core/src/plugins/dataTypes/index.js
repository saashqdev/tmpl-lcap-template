import { Decimal } from 'decimal.js';
import CryptoJS from 'crypto-js';
import { initService as configurationInitService } from '../../apis/configuration';
import { initService as logInitService } from '../../apis/log';
import {
  initApplicationConstructor,
  genInitData,
  isInstanceOf,
} from "./tools";
import { porcessPorts } from "../router/processService";

import Config from '../../config'
import authService from '../auth/authService';

window.CryptoJS = CryptoJS;
const aesKey = ";Z#^$;8+yhO!AhGo";
const databaseLoadFunMap = new Map();

export const genInitFromSchema = (typeKey, defaultValue, level) => genInitData(typeKey, defaultValue, level);

export default {
  install(Vue, options) {
    const dataTypesMap = options.dataTypesMap || {}; // TODO unified as dataTypesMap
    const i18nInfo = options.i18nInfo || {};
    initApplicationConstructor(dataTypesMap, Vue);
    /**
     * read datatypes from template, then parse schema
     * @param {*} schema is the refSchema used by the front end
     */
    Vue.prototype.$genInitFromSchema = genInitFromSchema;
    window.$genInitFromSchema = genInitFromSchema;

    const {
      frontendVariables,
      localCacheVariableSet
    } = Config.getFrontendVariables(options);

    const $g = {
      // User information
      userInfo: {},
      // Internationalization information
      i18nInfo: i18nInfo,
      //Front-end global variables
      frontendVariables,

      // add
      add(x, y) {
        if (typeof x !== "number" || typeof y !== "number") {
          return x + y;
        }
        if (!x) {
          x = 0;
        }
        if (!y) {
          y = 0;
        }
        const xx = new Decimal(x + "");
        const yy = new Decimal(y + "");
        return xx.plus(yy).toNumber();
      },
      // reduce
      minus(x, y) {
        if (!x) {
          x = 0;
        }
        if (!y) {
          y = 0;
        }
        const xx = new Decimal(x + "");
        const yy = new Decimal(y + "");
        return xx.minus(yy).toNumber();
      },
      // take
      multiply(x, y) {
        if (!x) {
          x = 0;
        }
        if (!y) {
          y = 0;
        }
        const xx = new Decimal(x + "");
        const yy = new Decimal(y + "");
        return xx.mul(yy).toNumber();
      },
      // remove
      divide(x, y) {
        if (!x) {
          x = 0;
        }
        if (!y) {
          y = 0;
        }
        const xx = new Decimal(x + "");
        const yy = new Decimal(y + "");
        return xx.div(yy).toNumber();
      },
      // equal
      isEqual(x, y) {
        // eslint-disable-next-line eqeqeq
        return x == y;
      },
      requestFullscreen() {
        return document.body.requestFullscreen();
      },
      exitFullscreen() {
        return document.exitFullscreen();
      },
      encryptByAES({ string: message }, key = aesKey) {
        const keyHex = CryptoJS.enc.Utf8.parse(key); //
        const messageHex = CryptoJS.enc.Utf8.parse(message);
        const encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });
        return encrypted.toString();
      },
      decryptByAES({ string: messageBase64 }, key = aesKey) {
        const keyHex = CryptoJS.enc.Utf8.parse(key);
        const decrypt = CryptoJS.AES.decrypt(messageBase64, keyHex, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        });
        const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
        return decryptedStr.toString();
      },
      hasAuth({ authPath }) {
        return authService.has(authPath);
      },
      getLocation() {
        return new Promise((res, rej) => {
          function showPosition(position) {
            const { latitude, longitude } = position.coords;
            const [mglng, mglat] = [longitude, latitude];
            res(`${mglng},${mglat}`);
          }
          function showError(error) {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                Config.Toast.error("User is prohibited from obtaining geolocation");
                rej({ code: error.code, msg: "User is prohibited from obtaining geolocation" });
                break;
              case error.POSITION_UNAVAILABLE:
                Config.Toast.error("Geographical location information cannot be obtained");
                rej({ code: error.code, msg: "Geographic location information cannot be obtained" });
                break;
              case error.TIMEOUT:
                Config.Toast.error("Geographic location information acquisition timeout");
                rej({ code: error.code, msg: "Geographic location information acquisition timeout" });
                break;
              case error.UNKNOWN_ERROR:
                Config.Toast.error("Unknown error");
                rej({ code: error.code, msg: "Unknown error" });
                break;
            }
          }
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
          } else {
            Config.Toast.error("The current system does not support geolocation");
            rej({ code: 666, msg: "The current system does not support geolocation" });
          }
        });
      },
      getDistance(s1, s2) {
        function deg2rad(deg) {
          return deg * (Math.PI / 180);
        }
        const lat1t = s1.split(",")[1];
        const lng1t = s1.split(",")[0];
        const lat2t = s2.split(",")[1];
        const lng2t = s2.split(",")[0];

        const R = 6371; // Radius of the earth in km
        const dLat = deg2rad(lat2t - lat1t); // deg2rad below
        const dLon = deg2rad(lng2t - lng1t);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(deg2rad(lat1t)) *
            Math.cos(deg2rad(lat2t)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d * 1000;
      },
      async getCustomConfig(configKey = "") {
        const configKeys = configKey.split(".");
        const finalConfigKey = configKeys.pop();
        const groupName = configKeys[configKeys.length - 2];
        const query = {
          group: groupName,
        };
        if (configKey.startsWith("extensions.")) {
          query.group = `${configKeys[0]}.${configKeys[1]}.${groupName}`;
        }
        const res = await configurationInitService().getCustomConfig({
          path: { configKey: finalConfigKey },
          query,
        });
        return res;
      },
      async getCurrentIp() {
        const res = await configurationInitService().getCurrentIp();
        return res;
      },
      getUserLanguage() {
        return navigator.language || navigator.userLanguage;
      },
      useDatabaseCallback() {
        // This is how $global.useDatabaseCallback()(__tableView_1_handleDataSourceLoad) is called
        return function (loadFun, ...args) {
          let loadMap = databaseLoadFunMap.get(loadFun);
          const cacheKey = $g.stringifyCurrentOnce([loadFun, ...args]);
          if (!loadMap) {
            loadMap = new Map();
            loadMap.set(cacheKey, (params) => {
              return loadFun(params, ...args);
            });
            databaseLoadFunMap.set(loadFun, loadMap);
          } else {
            if (!loadMap.has(cacheKey)) {
              loadMap.set(cacheKey, (params) => {
                return loadFun(params, ...args);
              });
            }
          }
          return loadMap.get(cacheKey);
        };
      },
      // Custom function to solve circular references
      stringifyCurrentOnce(array) {
        const newArray = array.map((current) => {
          // Only recognize the key declared by current, the rest may have vm, so only recognize these attributes
          if (typeof current === "object" && current !== null) {
            return {
              item: current.item,
              index: current.index,
              rowIndex: current.rowIndex,
              columnIndex: current.columnIndex,
              value: current.value,
            };
          }
          return current;
        });
        
        const seen = new WeakSet(); // Used to track object references
        return JSON.stringify(newArray, (key, value) => {
          if (typeof value === "object" && value !== null) {
            if (seen.has(value)) {
              // If the object has been serialized, avoid circular references
              return;
            }
            seen.add(value);
          }
          return value;
        });
      },
      /**
       * Report log information
       * @param {*} body 
       */
      async logReport(body) {
        try {
          const logService = logInitService();
          const res = await logService.logReport({
            body,
          });
          return res;
        } catch (err) {
          return err;
        }
      },
    };
    const $global = Config.setGlobal($g);

    Object.keys(porcessPorts).forEach((service) => {
      $global[service] = porcessPorts[service];
    });
    new View({
      data: {
        $global,
      },
    });

    Vue.prototype.$localCacheVariableSet = localCacheVariableSet;
    Vue.prototype.$global = $global;
    window.$global = $global;

    Vue.prototype.$isInstanceOf = isInstanceOf;

    // const enumsMap = options.enumsMap || {};
    // function createEnum(items) {
    //     const Enum = (key) => items[key];
    // Object.assign(Enum, items); // If items contains {name:'**'}, the assignment will report an error and the page will be blank, so it is blocked here
    //     return Enum;
    // }
    // Object.keys(enumsMap).forEach((enumKey) => {
    //     enumsMap[enumKey] = createEnum(enumsMap[enumKey] || {});
    // });

    function isLooseEqualFn(obj1, obj2, cache = new Map()) {
      // Check if the objects are the same
      if (obj1 === obj2) {
        return true;
      }
      // Whether the object has been compared, to solve the problem of circular dependency
      if (cache.has(obj1) && cache.get(obj1) === obj2) {
        return true;
      }
      // Check if the types are equal
      if (typeof obj1 !== typeof obj2) {
        return false;
      }
      // Check if the array length or the number of object attributes is consistent
      const keys1 = Object.keys(obj1);
      const keys2 = Object.keys(obj2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      // Add to cache
      cache.set(obj1, obj2);
      // Compare each value in the attribute to see if it is consistent
      for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];
        // recursion
        if (typeof val1 === "object" && typeof val2 === "object") {
          if (!isLooseEqualFn(val1, val2, cache)) {
            return false;
          }
        } else {
          // Determine whether the value of non-object is consistent
          if (val1 !== val2) {
            return false;
          }
        }
      }
      return true;
    }
    // Determine whether two objects are equal, without the need for exact reference consistency
    Vue.prototype.$isLooseEqualFn = isLooseEqualFn;
    const enumsMap = options.enumsMap || {};
    Vue.prototype.$enums = (key, value) => {
      if (!key || !value) return "";
      if (enumsMap[key]) {
        return enumsMap[key][value];
      } else {
        return "";
      }
    };

    // The entity's updateBy and deleteBy require processing request parameters in advance
    function parseRequestDataType(root, _prop) {
      let value;
      try {
        // eslint-disable-next-line no-eval
        value = eval(root[_prop]);
      } catch (err) {
        value = root.value;
      }
      const type = typeof value;
      // console.log('type:', type, value)
      if (type === "number") {
        root.concept = "NumericLiteral";
        root.value = value + "";
      } else if (type === "string") {
        root.concept = "StringLiteral";
        root.value = value;
      } else if (type === "boolean") {
        root.concept = "BooleanLiteral";
        root.value = value;
      } else if (type === "object") {
        if (Array.isArray(value)) {
          const itemValue = value[0];
          if (itemValue !== undefined) {
            const itemType = typeof itemValue;
            root.concept = "ListLiteral";
            if (itemType === "number") {
              root.value = value.map((v) => v + "").join(",");
            } else if (itemType === "string") {
              root.value = value.map((v) => "'" + v + "'").join(",");
            } else if (itemType === "boolean") {
              root.value = value.join(",");
            }
          }
        }
      }
    }

    // The entity's updateBy and deleteBy require processing request parameters in advance
    function resolveRequestData(root) {
      if (!root) return;
      // console.log(root.concept)
      delete root.folded;

      if (root.concept === "NumericLiteral") {
        // eslint-disable-next-line no-self-assign
        root.value = root.value;
      } else if (root.concept === "StringLiteral") {
        // eslint-disable-next-line no-self-assign
        root.value = root.value;
      } else if (root.concept === "NullLiteral") {
        delete root.value;
      } else if (root.concept === "BooleanLiteral") {
        root.value = root.value === "true";
      } else if (root.concept === "Identifier") {
        parseRequestDataType.call(this, root, "expression");
      } else if (root.concept === "MemberExpression") {
        if (root.expression) {
          parseRequestDataType.call(this, root, "expression");
        }
      }
      resolveRequestData.call(this, root.left);
      resolveRequestData.call(this, root.right);
      return root;
    }

    Vue.prototype.$resolveRequestData = resolveRequestData;
  }
}