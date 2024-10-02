### Process Record

The path aliases @ in the core directory of the basic package are all changed to relative paths to break away from build tool dependencies.

#### Utils/Create (✅)
- There is a piece of logic in the requester method that is only used by H5
- There is a piece of logic in the download method that is only used by PC
- Toast is provided in the form of injection.


#### Apis (✅)

- Export all APIs via index.js

```js
export { initService as initAuthService } from './auth'
export { initService as initConfigurationService } from "./configuration";
export { initService as initIoService } from './io'
export { initService as initLowauthService } from "./lowauth";
export { initService as initProcessService } from "./process";
```

#### Plugins/Common (✅)

- wx related, delete the logic implementation on the end

#### Plugins/DataTypes (✅)

|-- method name --|-- PC --|-- H5 --|
|:--:|:--:|:--:|
| compareKeyboardInput | ✅ |  |
| getIsMiniApp |  | ✅ |
| getWeChatOpenid |  | ✅ |
| getWeChatHeadImg |  | ✅ |
| getWeChatNickName |  | ✅ |
| navigateToUserInfo |  | ✅ |
| logout | ⚠️ | ⚠️ |
| setI18nLocale | ⚠️ | ⚠️ |
| getI18nList | ⚠️ | ⚠️ |
| hasAuth | ⚠️ | ⚠️ |
| downloadFile | ✅ |  |
| downloadFiles | ✅ |  |
| getUserList | ✅ |  |

```js
// config.js
 {
  getFrontendVariables: () => {
    return {
      frontendVariables: {},
      localCacheVariableSet: new Set(),
    };
  },
  $global: {},
 }
```


#### Plugins/Router (✅)
- config definition destination


#### Plugins/Utils (✅)
- The processing difference of time format ‘2022-11-11 12:12:12’ has been made compatible
```js
function fixIOSDateString(value) {
  // Determine whether it is an ios system
  if (!/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    return value;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}:\d{1,2})?$/.test(value)) {
    return value.replace(/-/g, "/");
  }

  return value;
}
```

### Business Side Usage Posture

```js
// main entry file
import '@lcap/mobile-ui/dist-theme/index.css';
import metaData from './metaData.json';
import platformConfig from './platform.config.json';
import { routes } from '@lcap/base-core/router/routes';
import cloudAdminDesigner from './init';

import { setConfig } from '@lcap/base-core';
// Implement the following content. The specific call location is searched in the core directory.
setConfig({
    $global: {}, // Refer to plugins/dataTypes to compare differences
    Toast: {
        show: (message, stack) => void 0,
        error: (message, stack) => void 0,
    },
    getFrontendVariables: () => {
        return {
            frontendVariables: {},
            localCacheVariableSet: new Set(),
        };
    },
    destination: () => void 0,
    createRouter: (routes) => void 0,
    getTitleGuard: (appConfig) => (to, from, next) => void 0,
});
cloudAdminDesigner.init(platformConfig?.appConfig, platformConfig, routes, metaData);

```

Core is used in init.js
```js
import filters from '@lcap/base-core/filters';
// import { AuthPlugin, DataTypesPlugin, LogicsPlugin, RouterPlugin, ServicesPlugin, UtilsPlugin } from '@/plugins';
import { AuthPlugin, DataTypesPlugin, LogicsPlugin, RouterPlugin, ServicesPlugin, UtilsPlugin } from '@lcap/base-core/plugins';
import { filterRoutes, parsePath } from '@lcap/base-core/utils/route';
import { getBasePath } from '@lcap/base-core/utils/encodeUrl';
import { filterAuthResources, findNoAuthView } from '@lcap/base-core/router/guards/auth';
```
