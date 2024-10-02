### 过程记录

基础包core目录下路径别名@都统一改用相对路径，脱离构建工具依赖

#### utils/create  (✅)
- requester方法中有一段仅H5使用的逻辑
- download方法中有一段仅PC使用的逻辑
- Toast通过注入的形式分端提供


#### apis (✅)

- 通过index.js导出所有api

```js
export { initService as initAuthService } from './auth'
export { initService as initConfigurationService } from "./configuration";
export { initService as initIoService } from './io'
export { initService as initLowauthService } from "./lowauth";
export { initService as initProcessService } from "./process";
```

#### plugins/common (✅)

- wx相关，删除端上逻辑实现

#### plugins/dataTypes (✅)

|-- 方法名 --|-- PC --|-- H5 --|
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


#### plugins/router (✅)
- config定义destination


#### plugins/utils (✅)
- 对时间格式‘2022-11-11 12:12:12’的处理差异，已做兼容
```js
function fixIOSDateString(value) {
  // 判断是否ios系统
  if (!/(iPhone|iPad|iPod|iOS)/i.test(navigator.userAgent)) {
    return value;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}(\s\d{1,2}:\d{1,2}:\d{1,2})?$/.test(value)) {
    return value.replace(/-/g, "/");
  }

  return value;
}
```

### 业务侧使用姿势

```js
// main入口文件 
import '@lcap/mobile-ui/dist-theme/index.css';
import metaData from './metaData.json';
import platformConfig from './platform.config.json';
import { routes } from '@lcap/base-core/router/routes';
import cloudAdminDesigner from './init';

import { setConfig } from '@lcap/base-core';
// 实现以下内容， 具体调用处在core目录下搜索
setConfig({
    $global: {}, // 参照plugins/dataTypes对比差异
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

init.js中都是用core
```js
import filters from '@lcap/base-core/filters';
// import { AuthPlugin, DataTypesPlugin, LogicsPlugin, RouterPlugin, ServicesPlugin, UtilsPlugin } from '@/plugins';
import { AuthPlugin, DataTypesPlugin, LogicsPlugin, RouterPlugin, ServicesPlugin, UtilsPlugin } from '@lcap/base-core/plugins';
import { filterRoutes, parsePath } from '@lcap/base-core/utils/route';
import { getBasePath } from '@lcap/base-core/utils/encodeUrl';
import { filterAuthResources, findNoAuthView } from '@lcap/base-core/router/guards/auth';
```
