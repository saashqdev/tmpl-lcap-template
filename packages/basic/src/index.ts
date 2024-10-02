import './types/global';

import Config, { setConfig } from './config';

export * from './apis'

export * from './init'

import {
  findNoAuthView,
  filterAuthResources,
  microFrontend,
  userInfoGuard,
} from './router'

import Global, { global } from './global'

export {
  Config,
  setConfig,

  findNoAuthView,
  filterAuthResources,
  microFrontend,
  userInfoGuard,
  Global,
  global,
};

export * from './utils'
export * from './Formatters'