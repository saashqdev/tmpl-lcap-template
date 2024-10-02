import Vue from 'vue';
import { cookie, authService, genSortedTypeKey, genInitFromSchema, initIoService, initLowauthService } from '@lcap/core-template';

export function getFrontendVariables(options) {
    const frontendVariables = {};
    const localCacheVariableSet = new Set();
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
        logout() {
            // FIXME 从全局变量中获取
            Vue.prototype
                .$confirm({
                    title: '提示',
                    content: '确定退出登录吗？',
                    message: '确定退出登录吗?',
                })
                .then(() => Vue.prototype.$auth.logout())
                .then(() => {
                    cookie.erase('authorization');
                    cookie.erase('username');
                    location.reload();
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
            // 调用UI库更新当前语言
            appVM.$i18n.locale = newLocale;
            // 调用UI库更新当前语言
            window.Vue.prototype.$CloudUILang = newLocale;
            // 重新加载页面
            window.location.reload();
        },
        getI18nList() {
            // 在ide中拼接好
            return $global.i18nInfo.I18nList || [];
        },

        /**
         * 比较键盘事件
         * @param {KeyboardEvent} event
         * @param {String[]} target
         */
        compareKeyboardInput(event, target) {
            // 将target转event
            const targetEvent = { altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, code: '' };
            target.forEach((item) => {
                if (item === 'Alt') {
                    targetEvent.altKey = true;
                } else if (item === 'Meta') {
                    targetEvent.metaKey = true;
                } else if (item === 'Control') {
                    targetEvent.ctrlKey = true;
                } else if (item === 'Shift') {
                    targetEvent.shiftKey = true;
                } else {
                    targetEvent.code = item;
                }
            });

            let isMatch = true;
            for (const key in targetEvent) {
                if (Object.hasOwnProperty.call(targetEvent, key)) {
                    if (targetEvent[key] !== event[key]) {
                        isMatch = false;
                    }
                }
            }

            return isMatch;
        },
        async downloadFile(url, fileName) {
            await initIoService()
                .downloadFiles({
                    body: {
                        urls: [url],
                        fileName,
                    },
                })
                .then((res) => Promise.resolve(res))
                .catch((err) => Promise.resolve(err));
        },
        async downloadFiles(urls, fileName) {
            await initIoService()
                .downloadFiles({
                    body: {
                        urls,
                        fileName,
                    },
                })
                .then((res) => Promise.resolve(res))
                .catch((err) => Promise.resolve(err));
        },
        async getUserList(query) {
            const appEnv = window.appInfo.env;
            const cookies = document.cookie.split('; ');
            const token = cookies.find((cookie) => cookie.split('=')[0] === 'authorization')?.split('=')[1];
            const res = await initLowauthService().getUserList({
                body: {
                    appEnv,
                    token,
                    ...query,
                },
            });
            return res;
        },
    });
}
