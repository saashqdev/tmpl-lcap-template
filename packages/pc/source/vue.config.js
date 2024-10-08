// When modifying this file, you need to modify source/icestark/vue.config.js and source/qiankun/vue.config.js
const path = require('path');

module.exports = {
    configureWebpack(config) {
        config.resolve.alias['@lcap/pc-ui$'] = path.resolve(__dirname, 'node_modules/@lcap/pc-ui/dist-theme/index.js');
        config.resolve.alias['@lcap/pc-ui/css$'] = path.resolve(__dirname, 'node_modules/@lcap/pc-ui/dist-theme/index.css');
        config.resolve.alias['cloud-ui.kubevue'] = '@lcap/pc-ui';

        if (process.env.NODE_ENV === 'production') {
            config.devtool = false;
        }
    },
    lintOnSave: false,
    runtimeCompiler: true,
    devServer: {
        port: 8810,
        proxy: {
            '/assets': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                autoRewrite: true,
            },
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                autoRewrite: true,
            },
            '/rest': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                autoRewrite: true,
            },
            '^/gateway/': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                autoRewrite: true,
            },
            '^/gw/': {
                target: `http://localhost:8080`,
                changeOrigin: true,
                autoRewrite: true,
            },
            '^/upload': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                autoRewrite: true,
            },
        },
    },
};
