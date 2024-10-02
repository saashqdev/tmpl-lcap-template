import { Decimal } from "decimal.js";
import CryptoJS from "crypto-js";

import { initService as initConfigurationService } from "../../apis/configuration";
import { initService as initIoService } from "../../apis/io";
import { initService as initLowauthService } from "../../apis/lowauth";

import Config from "../../config";

import authService from "../auth/authService";

import { navigateToUserInfoPage } from "./wx";

window.CryptoJS = CryptoJS;

export function add(x, y) {
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
}

export function minus(x, y) {
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  const xx = new Decimal(x + "");
  const yy = new Decimal(y + "");
  return xx.minus(yy).toNumber();
}

export function multiply(x, y) {
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  const xx = new Decimal(x + "");
  const yy = new Decimal(y + "");
  return xx.mul(yy).toNumber();
}

export function divide(x, y) {
  if (!x) {
    x = 0;
  }
  if (!y) {
    y = 0;
  }
  const xx = new Decimal(x + "");
  const yy = new Decimal(y + "");
  return xx.div(yy).toNumber();
}

export function isEqual(x, y) {
  // eslint-disable-next-line eqeqeq
  return x == y;
}

export function requestFullscreen() {
  return document.body.requestFullscreen();
}

export function exitFullscreen() {
  return document.exitFullscreen();
}

const aesKey = ";Z#^$;8+yhO!AhGo";
export function encryptByAES({ string: message }, key = aesKey) {
  const keyHex = CryptoJS.enc.Utf8.parse(key); //
  const messageHex = CryptoJS.enc.Utf8.parse(message);
  const encrypted = CryptoJS.AES.encrypt(messageHex, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  return encrypted.toString();
}

export function decryptByAES({ string: messageBase64 }, key = aesKey) {
  const keyHex = CryptoJS.enc.Utf8.parse(key);
  const decrypt = CryptoJS.AES.decrypt(messageBase64, keyHex, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
  });
  const decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
}

export function hasAuth({ authPath }) {
  return authService.has(authPath);
}

export function getLocation() {
  return new Promise((res, rej) => {
    function showPosition(position) {
      const { latitude, longitude } = position.coords;
      const [mglng, mglat] = [longitude, latitude];
      res(`${mglng},${mglat}`);
    }

    function showError(error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          Config.toast.error("User is prohibited from obtaining geolocation");
          rej({ code: error.code, msg: "User is prohibited from obtaining geolocation" });
          break;
        case error.POSITION_UNAVAILABLE:
          Config.toast.error("Geographical location information cannot be obtained");
          rej({ code: error.code, msg: "Geographic location information cannot be obtained" });
          break;
        case error.TIMEOUT:
          Config.toast.error("Geographic location information acquisition timeout");
          rej({ code: error.code, msg: "Geographic location information acquisition timeout" });
          break;
        case error.UNKNOWN_ERROR:
          Config.toast.error("unknown error");
          rej({ code: error.code, msg: "Unknown error" });
          break;
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
      Config.toast.error("The current system does not support geolocation");
      rej({ code: 666, msg: "The current system does not support geolocation" });
    }
  });
}

export function getDistance(s1, s2) {
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
}

export async function getCustomConfig(configKey = "") {
  const configKeys = configKey.split(".");
  const finalConfigKey = configKeys.pop();
  const groupName = configKeys[configKeys.length - 2];
  const query = {
    group: groupName,
  };
  if (configKey.startsWith("extensions.")) {
    query.group = `${configKeys[0]}.${configKeys[1]}.${groupName}`;
  }
  const res = await initConfigurationService().getCustomConfig({
    path: { configKey: finalConfigKey },
    query,
  });
  return res;
}

export async function getCurrentIp() {
  const res = await initConfigurationService().getCurrentIp();
  return res;
}

export function getUserLanguage() {
  return navigator.language || navigator.userLanguage;
}

export function compareKeyboardInput(event, target) {
  // Convert target to event
  const targetEvent = {
    altKey: false,
    ctrlKey: false,
    metaKey: false,
    shiftKey: false,
    code: "",
  };
  target.forEach((item) => {
    if (item === "Alt") {
      targetEvent.altKey = true;
    } else if (item === "Meta") {
      targetEvent.metaKey = true;
    } else if (item === "Control") {
      targetEvent.ctrlKey = true;
    } else if (item === "Shift") {
      targetEvent.shiftKey = true;
    } else {
      targetEvent.code = item;
    }
  });

  let isMatch = true;
  for (const key in targetEvent) {
    if (Object.hasOwnProperty.call(targetEvent, key)) {
      if (targetEvent[key] !== event[key]) {
        isMatch = false;
      }
    }
  }

  return isMatch;
}

export async function downloadFile(url, fileName) {
  await initIoService()
    .downloadFiles({
      body: {
        urls: [url],
        fileName,
      },
    })
    .then((res) => Promise.resolve(res))
    .catch((err) => Promise.resolve(err));
}

export async function downloadFiles(urls, fileName) {
  await initIoService()
    .downloadFiles({
      body: {
        urls,
        fileName,
      },
    })
    .then((res) => Promise.resolve(res))
    .catch((err) => Promise.resolve(err));
}

export async function getUserList(query) {
  const appEnv = window.appInfo.env;
  const cookies = document.cookie.split("; ");
  const token = cookies
    .find((cookie) => cookie.split("=")[0] === "authorization")
    ?.split("=")[1];
  const res = await initLowauthService().getUserList({
    body: {
      appEnv,
      token,
      ...query,
    },
  });
  return res;
}

// Below is the method of H5 end
export function getIsMiniApp() {
  return window.__wxjs_environment === "miniprogram";
}

export function getWeChatOpenid() {
  return localStorage.getItem("_wx_openid");
}

export function getWeChatHeadImg() {
  return localStorage.getItem("_wx_headimg");
}

export function getWeChatNickName() {
  return localStorage.getItem("_wx_nickname");
}

export function navigateToUserInfo() {
  return navigateToUserInfoPage();
}

export function setI18nLocale(newLocale) {
  // Modify the language identifier stored in local
  localStorage.i18nLocale = newLocale;
  // Reload the page
  window.location.reload();
}

export function getI18nList() {
  // Splice in ide
  return window.$global.i18nInfo.I18nList || [];
}