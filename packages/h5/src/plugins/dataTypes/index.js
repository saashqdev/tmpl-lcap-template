import Vue from 'vue';
import { cookie, storage, authService, genSortedTypeKey, getBasePath, genInitFromSchema } from '@lcap/core-template';
import { navigateToUserInfoPage, navigateToUserPhonePage, navigateScanCodePage, navigateLocationPage } from '../common/wx';

export function getFrontendVariables(options) {
    const frontendVariables = {};
    const localCacheVariableSet = new Set(); // 本地存储的全局变量集合

    if (Array.isArray(options && options.frontendVariables)) {
        options.frontendVariables.forEach((frontendVariable) => {
            const { name, typeAnnotation, defaultValueFn, defaultCode, localCache } = frontendVariable;
            localCache && localCacheVariableSet.add(name); // 本地存储的全局变量集合
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
            // FIXME 从全局变量中获取
            Vue.prototype
                .$confirm({
                    title: '提示',
                    message: '确定退出登录吗?',
                    content: '确定退出登录吗？',
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
            // 修改local中的存储的语言标识
            localStorage.i18nLocale = newLocale;
            // 修改当前template的语言
            $global.i18nInfo.locale = newLocale;
            $global.i18nInfo.currentLocale = newLocale;
            // 修改当前语言名称
            $global.i18nInfo.localeName = this.getI18nList().find((item) => item.id === newLocale)?.name;
            // 更新当前模板的语言
            appVM.$i18n.locale = newLocale;
            // 调用UI库更新当前语言
            window.Vue.prototype.$vantLang = newLocale;
            // 重新加载页面
            window.location.reload();
        },
        getI18nList() {
            // 在ide中拼接好
            return $global.i18nInfo.I18nList || [];
        },
    });
}
