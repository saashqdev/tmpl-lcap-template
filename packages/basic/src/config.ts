import { encodeUrl } from "./utils";

// Differential configuration, incoming coverage when started by H5 and PC
const Config = {
  toast: {
    show: (message, stack?) => void 0,
    error: (message, stack?) => void 0,
  },
  utils: {},
  router: {
    destination: (url: string, target: string) => {
      if (target === "_self") {
        location.href = encodeUrl(url);
      } else {
        window.open(encodeUrl(url), target);
      }
    },
  },
  axios: {
    interceptors: []
  }
};

export function setConfig(newConfig) {
  Object.assign(Config, newConfig);
}

export function getConfig() {
  return Config;
}

export default Config;