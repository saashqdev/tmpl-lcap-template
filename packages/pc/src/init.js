import Vue from 'vue';
import { installOptions, installFilters, installComponents, installDirectives, install } from '@kubevue/utils';

import * as Components from '@/components';

import './setConfig';

import {
    filters,
    directives,
    AuthPlugin,
    DataTypesPlugin,
    LogicsPlugin,
    RouterPlugin,
    ServicesPlugin,
    UtilsPlugin,
    initRouter,
    microFrontend,
    filterRoutes,
    parsePath,
    getBasePath,
    filterAuthResources,
    findNoAuthView,
    createService,
} from '@lcap/core-template';

import { getTitleGuard } from './router';

import VueI18n from 'vue-i18n';
import App from './App.vue';

import '@/assets/css/index.css';

Vue.prototype.$sleep = function () {
    return new Promise((resolve) => {
        this.$nextTick(resolve);
    });
};

window._lcapCreateService = createService;
window.appVue = Vue;
window.Vue = Vue;
window.LcapInstall = install;

installOptions(Vue);
installDirectives(Vue, directives);

const fnList = ['afterRouter'];
const evalWrap = function (metaData, fnName) {
    // eslint-disable-next-line no-eval
    metaData && fnName && metaData?.frontendEvents[fnName] && eval(metaData.frontendEvents[fnName]);
};

// It needs to be compatible with products of old applications, so the entry function parameters of the new version will not be changed.
const init = (appConfig, platformConfig, routes, metaData) => {
    // No logic in the application can be accessed before the application is initialized.
    evalWrap.bind(window)(metaData, 'rendered');
    ['preRequest', 'postRequest'].forEach((fnName) => {
        evalWrap.bind(window)(metaData, fnName);
    });
    if (window.LcapMicro?.container) {
        if (document.currentScript && (!document.head.contains(document.currentScript) || document.currentScript.active === false)) return;

        if (Vue.prototype.$auth?._map) Vue.prototype.$auth._map = undefined;
    }

    window.appInfo = Object.assign(appConfig, platformConfig);

    installFilters(Vue, filters);
    installComponents(Vue, Components);

    // Handle current language
    let locale = 'en-US';
    if (appConfig.i18nInfo) {
        const { I18nList, messages } = appConfig.i18nInfo;
        locale = getUserLanguage(appConfig, messages);
        // Reset the current effective language
        appConfig.i18nInfo.locale = locale;
        appConfig.i18nInfo.currentLocale = locale;
        // Set the current language name
        appConfig.i18nInfo.localeName = I18nList?.find((item) => item.id === locale)?.name;
        // Set translation information for the current language
        window.Vue.prototype.$CloudUILang = locale;

        Object.keys(messages).forEach((key) => {
            if (Vue.prototype.$CloudUIMessages[key]) {
                Object.assign(Vue.prototype.$CloudUIMessages[key], messages[key]);
            } else {
                Vue.prototype.$CloudUIMessages[key] = messages[key];
            }
        });
    }
    const i18nInfo = appConfig.i18nInfo;
    const i18n = new VueI18n({
        locale: locale,
        messages: i18nInfo.messages,
    });
    window.$i18n = i18n;

    Vue.use(LogicsPlugin, metaData);
    Vue.use(RouterPlugin);
    Vue.use(ServicesPlugin, metaData);
    Vue.use(AuthPlugin);
    Vue.use(UtilsPlugin, metaData);
    Vue.use(DataTypesPlugin, { ...metaData, i18nInfo: appConfig.i18nInfo });

    // Already obtained the permission interface
    Vue.prototype.hasLoadedAuth = false;

    // Are you already logged in?
    Vue.prototype.logined = true;

    // Global catch error is mainly used to handle the abort component. The errors do not want to be exposed to the user, and the rest are still prompted on the console.
    Vue.config.errorHandler = (err, vm, info) => {
        if (err.name === 'Error' && err.message === 'Program aborted') {
            console.warn('Program terminated');
        } else {
            // err, error object
            // vm, the component instance where the error occurred
            // info, Vue-specific error information, such as the life cycle of the error and the event in which the error occurred
            console.error(err);
        }
    };
    if (!window?.$toast) {
        window.$toast = window.Vue.prototype.$toast;
    }
    if (window?.rendered) {
        window.rendered();
    }
    const baseResourcePaths = platformConfig.baseResourcePaths || [];
    const authResourcePaths = platformConfig.authResourcePaths || [];
    const baseRoutes = filterRoutes(routes, null, (route, ancestorPaths) => {
        const routePath = route.path;
        const completePath = [...ancestorPaths, routePath].join('/');
        let completeRedirectPath = '';
        const redirectPath = route.redirect;
        if (redirectPath) {
            completeRedirectPath = [...ancestorPaths, redirectPath].join('/');
        }
        return baseResourcePaths.includes(completePath) || completeRedirectPath;
    });

    const router = initRouter(baseRoutes);
    const fnName = 'beforeRouter';
    if (fnName && metaData.frontendEvents[fnName]) {
        evalWrap.bind(window)(metaData, fnName);
        Vue.prototype[fnName] = window[fnName];
    }
    const beforeRouter = Vue.prototype.beforeRouter;
    const getAuthGuard = (router, routes, authResourcePaths, appConfig, baseResourcePaths, beforeRouter) => async (to, from, next) => {
        try {
            if (beforeRouter) {
                const event = {
                    baseResourcePaths,
                    router,
                    routes,
                    authResourcePaths,
                    appConfig,
                    beforeRouter,
                    to,
                    from,
                    next,
                    parsePath,
                    getBasePath,
                    filterAuthResources,
                    findNoAuthView,
                    filterRoutes,
                };
                await beforeRouter(event);
            } else {
                next();
            }
        } catch (err) {
            next();
        }
    };
    beforeRouter && router.beforeEach(getAuthGuard(router, routes, authResourcePaths, appConfig, baseResourcePaths, window.beforeRouter));
    router.beforeEach(getTitleGuard(appConfig));
    router.beforeEach(microFrontend);

    const app = new Vue({
        name: 'app',
        router,
        i18n,
        ...App,
    });

    if (metaData && metaData.frontendEvents) {
        for (let index = 0; index < fnList.length; index++) {
            const fnName = fnList[index];
            if (fnName && metaData.frontendEvents[fnName]) {
                evalWrap.bind(app)(metaData, fnName);
                Vue.prototype[fnName] = window[fnName];
            }
        }
    }
    const afterRouter = Vue.prototype.afterRouter;

    afterRouter &&
        router.afterEach(async (to, from, next) => {
            try {
                if (afterRouter) {
                    await afterRouter(to, from);
                }
            } catch (err) {}
        });

    if (window.LcapMicro?.container) {
        const container = window.LcapMicro.container;
        container.innerHTML = '';
        app.$mount();
        container.appendChild(app.$el);
    } else app.$mount('#app');

    return app;
};

function getUserLanguage(appConfig, messages = {}) {
    let locale = localStorage.i18nLocale;
    // If there is no default language for reading the main application in local
    if (!messages[locale]) {
        // If there is no current browser setting, read the default language of the main application
        locale = navigator.language || navigator.userLanguage;

        if (!messages[locale]) {
            // If not in the list, get the first two digits of the language code
            let baseLang = locale.substring(0, 2);
            const languageList = Object.keys(messages);
            // Find if there is an item in the list that is the same as the base language code
            let match = languageList.find((lang) => lang.startsWith(baseLang));
            // If the first two characters are the same, use this
            if (match) {
                locale = match;
            } else {
                // If it does not exist, use the default language
                locale = appConfig.i18nInfo.locale || 'en-US';
            }
        }
    }
    return locale;
}
export default {
    init,
};
