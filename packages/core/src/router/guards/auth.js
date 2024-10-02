import Vue from 'vue';

import { filterRoutes, parsePath } from '../../utils/route';
import { getBasePath } from '../../utils/encodeUrl';

/**
 * Are there any unauthorized pages?
 * @param {*} routes
 */
export function findNoAuthView(routes) {
    if (Array.isArray(routes)) {
        return routes.find((route) => route?.path === `${getBasePath()}/noAuth`);
    }
}

const ROOT_PATH = '/';

const getParentPath = (path) => path === ROOT_PATH ? null : path.substring(0, path.lastIndexOf('/')) || ROOT_PATH;

function generatePaths(str) {
    let parts = str.split('/');
    let paths = [];
  
    for (let i = 0; i < parts.length; i++) {
      let path = parts.slice(0, i + 1).join('/');
      path && paths.push([path, 1]);
    }
  
    return paths;
  }

/**
 * Filter unauthorized pages (X2.22_0629 adjustment). If the subpage is bound to a role and the parent page is not bound, the subpage cannot be accessed.
 * More edge case reference cases: tests\unit\global\routes\route.spec.js
 * @param {*} resources
 */
export function filterAuthResources(resources) {
    if (!Array.isArray(resources) || !resources.length)
        return [];

    const bases = generatePaths(getBasePath());

    const validPaths = resources.reduce((map, item) => {
        map.set(item.resourceValue, 1);
        return map;
    }, new Map([[ROOT_PATH, 1], ...bases])); // Please note that all routes have a basePath at the beginning (PC&H5 all have unfixed starting routes)

    const isValidPath = (path) => {
        let parentPath = getParentPath(path);
        while (parentPath && validPaths.has(parentPath))
            parentPath = getParentPath(parentPath);
        return !parentPath;
    };
    return resources.filter((item) => isValidPath(item.resourceValue));
}

export const getAuthGuard = (router, routes, authResourcePaths, appConfig, baseResourcePaths) => async (to, from, next) => {
    function addAuthRoutes(resources) {
        if (Array.isArray(resources) && resources.length) {
            const userResourcePaths = (resources || []).map((resource) => resource?.resourceValue || resource?.ResourceValue);
            const otherRoutes = filterRoutes(routes, null, (route, ancestorPaths) => {
                const routePath = route.path;
                const completePath = [...ancestorPaths, routePath].join('/');
                const authPath = userResourcePaths.find((userResourcePath) => userResourcePath?.startsWith(completePath));
                return authPath;
            });
            otherRoutes.forEach((route) => {
                router.addRoute(route);
            });
        }
    }
    function concatResourcesRoutes(resources, baseRoutes) {
        return resources.concat(baseRoutes.map((route) => ({
            resourceValue: route,
            // If you need to distinguish routing types later, you also need to add resourceType here.
        })));
    }
    const userInfo = Vue.prototype.$global.userInfo || {};
    const $auth = Vue.prototype.$auth;
    const redirectedFrom = parsePath(to.redirectedFrom);
    const toPath = redirectedFrom?.path || to.path;
    const toQuery = redirectedFrom?.query || to.query;
    const authPath = authResourcePaths.find((authResourcePath) => {
        if (authResourcePath === toPath || `${authResourcePath}/` === toPath) {
            return true;
        }
        return false;
    });
    const noAuthView = findNoAuthView(routes);
    if (authPath) {
        if (!$auth.isInit()) {
            if (!userInfo.UserId) {
                localStorage.setItem('beforeLogin', JSON.stringify(location));
                next({ path: `${getBasePath()}/login` });
            } else {
                try {
                    const resources = await $auth.getUserResources(appConfig.domainName);
                    const realResources = filterAuthResources(concatResourcesRoutes(resources, baseResourcePaths));
                    addAuthRoutes(realResources);
                    // Even if the permission is not found, you still need to go through it again to decide whether to go to the no permission page or the 404 page.
                    next({
                        path: toPath,
                        query: toQuery,
                    });
                } catch (err) {
                    if (noAuthView?.path) {
                        next({ path: noAuthView.path });
                    }
                }
            }
        } else if (redirectedFrom?.path !== to.path && to.path === `${getBasePath()}/notFound`) {
            if (noAuthView?.path) {
                next({ path: noAuthView.path });
            }
        }
    } else if (!$auth.isInit() && userInfo.UserId) {
        const resources = await $auth.getUserResources(appConfig.domainName);
        const realResources = filterAuthResources(concatResourcesRoutes(resources, baseResourcePaths));
        addAuthRoutes(realResources);
    }

    next();
};
