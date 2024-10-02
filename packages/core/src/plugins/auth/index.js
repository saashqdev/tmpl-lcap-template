import authService, { runAhead } from './authService';

export default {
    install(Vue, options = {}) {
        authService.start();
        options.allowList = options.allowList || [];
        const router = options.router;
        const base = (options.base || '').replace(/\/$/, '');
        /**
        * Whether there are sub-permissions under the current route
        * This method can only be called in Vue
        * @param {*} subPath sub-permission path, such as /createButton/enabled
        */
        authService.hasSub = function (subPath) {
            const currentPath = base + router.currentRoute.path;
            if (subPath[0] !== '/')
                subPath = '/' + subPath;
            return this.has(currentPath + subPath);
        };
        authService.hasFullPath = function (path) {
            if (path[0] !== '/')
                path = '/' + path;
            return this.has(base + path);
        };
        /**
         * Account and Permission Center
         */
        Vue.prototype.$auth = authService;
        window.$auth = authService;
        // Designer and environment directly release authentication and authorization
        if (process.env.NODE_ENV === 'development' || process.env.VUE_APP_DESIGNER) {
            Vue.directive('auth', {
                bind() {
                    // nope
                },
            });
            return;
        }

        /**
         * - Component permission item function
         * - Automatically hide routing component function
         * There are only three solutions to achieve this requirement:
         * - Modify the v-show or disabled attribute in the source code, for example: disabled="!$auth.hasSub('createButton/enabled') || !canSubmit",
         * This fundamentally changes the render function, which is risky and nauseating
         * - Implant something in the updated phase. The disadvantage is that it will be done again every time it is updated.
         * - Modifying the disabled attribute of the original component is not recommended. This also applies to wrapping components in the outer layer.
         */
        /**
         * Permission Command
         * value binds the permission item. If not passed, the ref name is used.
         * The names of modifiers are used for sub-permission behaviors. There are problems with component attributes and they are not implemented yet.
         */
        const vAuth = {
            async handle(el, binding, vnode, oldVnode) {
                // Initialize the operation to prevent it from appearing first and then disappearing
                if (el.__vue__ && el.__vue__.$options.name === 'u-table-view-column')
                    el.__vue__.currentHidden = false;
                else {
                    el && (el.style.display = 'none');
                }
                const data = {
                    value: binding.value || '',
                    actions: Object.keys(binding.modifiers),
                };

                // const authPath = `${base + router.currentRoute.path}/${data.value ? data.value : vnode.data.ref}`;
                const authPath = data.value;
                const visible = await authService.has(authPath, options?.domainName);

                // Table columns do not work, special processing
                if (el.__vue__ && el.__vue__.$options.name === 'u-table-view-column')
                    el.__vue__.currentHidden = !visible;
                else {
                    el && (el.style.display = visible ? '' : 'none');
                }
            },
            bind(el, binding, vnode, oldVnode) {
                vAuth.handle(el, binding, vnode, oldVnode);
            },
            update(el, binding, vnode, oldVnode) {
                vAuth.handle(el, binding, vnode, oldVnode);
            },
        };
        Vue.directive('auth', vAuth);

        View.mixin({
            mounted() {
                // Currently only permissions are visible and invisible
                this._updateVisibleByAuth();
            },
            updated() {
                this._updateVisibleByAuth();
            },
            methods: {
                _updateVisibleByAuth() {
                    if (!(options.autoHide && this.to))
                        return;
                    // With v-auth, to is not processed.
                    if (this.$vnode.data.directives && this.$vnode.data.directives.some((directive) => directive.name === 'auth'))
                        return;
                    if ( ! authService . isInit ())
                        return;

                    let visible = true;
                    if (options.autoHide && this.to) {
                        let toPath;
                        if (typeof this.to === 'object')
                            toPath = this.to.path;
                        else if (typeof this.to === 'string')
                            toPath = this.to.split('?')[0];
                        // Remove the trailing / to prevent permissions from matching
                        const fullPath = (base + toPath).replace(/\/+$/, '');
                        visible = visible && authService.has(fullPath);
                    }

                    this.$el && (this.$el.style.display = visible ? '' : 'none');
                },
            },
        });
    },
};

export {
  authService,
  runAhead
}