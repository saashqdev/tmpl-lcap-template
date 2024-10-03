import Vue from 'vue';
import { cookie, storage, authService, genSortedTypeKey, getBasePath, genInitFromSchema } from '@lcap/core-template';
import { navigateToUserInfoPage, navigateToUserPhonePage, navigateScanCodePage, navigateLocationPage } from '../common/wx';

export function getFrontendVariables(options) {
    const frontendVariables = {};
    const localCacheVariableSet = new Set(); // A collection of locally stored global variables

    if (Array.isArray(options && options.frontendVariables)) {
        options.frontendVariables.forEach((frontendVariable) => {
            const { name, typeAnnotation, defaultValueFn, defaultCode, localCache } = frontendVariable;
            localCache && localCacheVariableSet.add(name); // A collection of locally stored global variables
            let defaultValue = defaultCode?.code;
            if (Object.prototype.toString.call(defaultValueFn) === '[object Function]') {
                defaultValue = defaultValueFn(Vue);
            }
            frontendVariables[name] = genInitFromSchema(genSortedTypeKey(typeAnnotation), defaultValue);
        });
    }

    return {
        frontendVariables,
        localCacheVariableSet,
    };
}

export function setGlobal($global) {
    return Object.assign($global, {
        getIsMiniApp() {
            return window.__wxjs_environment === 'miniprogram';
        },
        getWeChatOpenid() {
            return localStorage.getItem('_wx_openid');
        },
        getWeChatHeadImg() {
            return localStorage.getItem('_wx_headimg');
        },
        getWeChatNickName() {
            return localStorage.getItem('_wx_nickname');
        },
        getWeChatPhone() {
            return localStorage.getItem('_wx_phone');
        },
        getWeChatScanCode() {
            const data = localStorage.getItem('_wx_scan_code');
            localStorage.setItem('_wx_scan_code', '');
            return data;
        },
        getWeChatLocation() {
            const data = localStorage.getItem('_wx_location');
            localStorage.setItem('_wx_location', '');
            return data;
        },
        navigateToUserInfo() {
            navigateToUserInfoPage();
        },
        navigateToUserPhone() {
            navigateToUserPhonePage();
        },
        navigateToScanCode() {
            navigateScanCodePage();
        },
        navigateToLocation() {
            navigateLocationPage();
        },
        hasAuth(authPath) {
            return authService.has(authPath);
        },
        logout() {
            // FIXME is obtained from global variables
            Vue.prototype
                .$confirm({
                    title: 'Tips',
                    message: 'Are you sure you want to log out?',
                    content: 'Are you sure you want to log out? ',
                })
                .then(async () => {
                    try {
                        await authService.logout();
                    } catch (error) {
                        console.warn(error);
                    }
                    storage.set('Authorization', '');
                    // cookie.eraseAll();
                    cookie.erase('authorization');
                    cookie.erase('username');
                    window.location.href = `${getBasePath()}/login`;
                })
                .catch(() => {
                    // on cancel
                });
        },
        setI18nLocale(newLocale) {
            // Modify the language identifier stored in local
            localStorage.i18nLocale = newLocale;
            // Modify the language of the current template
            $global.i18nInfo.locale = newLocale;
            $global.i18nInfo.currentLocale = newLocale;
            // Modify the current language name
            $global.i18nInfo.localeName = this.getI18nList().find((item) => item.id === newLocale)?.name;
            // Update the language of the current template
            appVM.$i18n.locale = newLocale;
            // Call the UI library to update the current language
            window.Vue.prototype.$vantLang = newLocale;
            // Reload the page
            window.location.reload();
        },
        getI18nList() {
            // Spliced in IDE
            return $global.i18nInfo.I18nList || [];
        },
    });
}
