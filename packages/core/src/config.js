// Differential configuration, incoming coverage when started by H5 and PC
const Config = {
  $global: {},
  Toast: {
    show: (message, stack) => void 0,
    error: (message, stack) => void 0,
  },
  // getFrontendVariables: (options) => {
  //   return {
  //     frontendVariables: {},
  //     localCacheVariableSet: new Set(),
  //   };
  // },
  // destination: () => void 0,
  // createRouter: ({ routes, VueRouter }) => void 0,
  // getTitleGuard: (appConfig) => (to, from, next) => void 0,
  utils: {}
};

export function setConfig(newConfig) {
  Object.assign(Config, newConfig);
}

export function getConfig() {
  return Config;
}

export default Config;