import { getComponentOption } from '@lcap/core-template'

export const getTitleGuard = (appConfig) => (to, from, next) => {
    const metaTitle = to.matched.concat().reverse().map((item) => {
        const componentOptions = getComponentOption(item);
        return componentOptions?.meta?.title || item.path.slice(1) || item.meta?.title;
    }).filter((i) => i)[0];
    if (metaTitle) {
        if (typeof metaTitle === 'function') {
            document.title = metaTitle(to, from);
        } else {
            if (appConfig.documentTitle) {
                document.title = appConfig.documentTitle.replace(/\$Page Title/g, metaTitle).replace(/\$Application Name/g, appConfig.project);
            } else {
                document.title = `${metaTitle}-${appConfig.project}`;
            }
        }
    }
    next();
};
