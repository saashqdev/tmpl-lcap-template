import './public-path';
import metaData from './metaData.js';
import platformConfig from './platform.config.json';
import { routes } from './router/routes';
import './library';
import cloudAdminDesigner from './init';

if (!window.__POWERED_BY_QIANKUN__) {
    cloudAdminDesigner.init(platformConfig?.appConfig, platformConfig, routes, metaData);
}
let appVM;

export async function bootstrap() {
    return Promise.resolve();
}
export async function mount(props) {
    window.LcapMicro = window.LcapMicro || {};
    Object.assign(window.LcapMicro, __properties__);

    if(window.LcapMicro.noAuthUrl && !window.LcapMicro.noAuthFn)
        window.LcapMicro.noAuthFn = () => {
            location.href = window.LcapMicro.noAuthUrl;
        };

    if(window.LcapMicro.loginUrl && !window.LcapMicro.loginFn)
        window.LcapMicro.loginFn = () => {
            location.href = window.LcapMicro.loginUrl;
        };

    if(window.LcapMicro.notFoundUrl && !window.LcapMicro.notFoundFn)
        window.LcapMicro.notFoundFn = () => {
            location.href = window.LcapMicro.notFoundUrl;
        };

    const { container } = props;
    window.LcapMicro.container = container.querySelector('#app');
    // window.LcapMicro.appendTo = container.querySelector('#app');  // If style isolation is turned on, appendTo needs to be set, and components such as pop-up windows will be hung on the container.
    window.LcapMicro.props = props;
    appVM = cloudAdminDesigner.init(platformConfig?.appConfig, platformConfig, routes, metaData);
    return Promise.resolve();
}
export async function unmount() {
    window.LcapMicro.container.innerHTML = null;
    appVM?.$destroy();
    return Promise.resolve();
}

