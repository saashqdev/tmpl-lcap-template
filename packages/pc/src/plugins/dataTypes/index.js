import Vue from 'vue';
import { cookie, authService, genSortedTypeKey, genInitFromSchema, initIoService, initLowauthService } from '@lcap/core-template';

export function getFrontendVariables(options) {
    const frontendVariables = {};
    const localCacheVariableSet = new Set();
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
        logout() {
            // FIXME is obtained from global variables
            Vue.prototype
                .$confirm({
                    title: 'Tips',
                    content: 'Are you sure you want to log out? ',
                    message: 'Are you sure you want to log out?',
                })
                .then(() => Vue.prototype.$auth.logout())
                .then(() => {
                    cookie.erase('authorization');
                    cookie.erase('username');
                    location.reload();
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
            // Call the UI library to update the current language
            appVM.$i18n.locale = newLocale;
            // Call the UI library to update the current language
            window.Vue.prototype.$CloudUILang = newLocale;
            // Reload the page
            window.location.reload();
        },
        getI18nList() {
            // Spliced in IDE
            return $global.i18nInfo.I18nList || [];
        },

        /**
         * Compare keyboard events
         * @param {KeyboardEvent} event
         * @param {String[]} target
         */
        compareKeyboardInput(event, target) {
            // Convert target to event
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
