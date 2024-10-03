// When modifying this file, source/icestark/main.js and source/qiankun/main.js need to be modified simultaneously
import metaData from './metaData.js';
import platformConfig from './platform.config.json';
import { routes } from './router/routes';
import cloudAdminDesigner from './init';
import './library';

cloudAdminDesigner.init(platformConfig?.appConfig, platformConfig, routes, metaData);
