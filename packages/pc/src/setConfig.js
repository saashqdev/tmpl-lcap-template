import Vue from 'vue';
import { setConfig } from '@lcap/core-template';

import { getFrontendVariables, setGlobal } from './plugins/dataTypes/index';
import { destination } from './plugins/router';
import { createRouter } from './router';

// Set core config
setConfig({
    Toast: {
        show:
            Vue.prototype?.$toast?.show ||
            (() => {
                console.warn('Please mount the $toast.show method on Vue.prototype');
            }),
        error:
            Vue.prototype?.$toast?.error ||
            (() => {
                console.warn('Please mount the $toast.error method on Vue.prototype');
            }),
    },
    setGlobal,
    getFrontendVariables,
    destination,
    createRouter,
    utils: {
        decodeDownloadName: (effectiveFileName) => {
            return decodeURIComponent(effectiveFileName);
        },
    },

    configureRequest(options) {
        /**
         * options configuration reference
         * https://axios-http.com/docs/req_config
         */

        // Modify request baseURL
        // options.baseURL = 'https://some-domain.com/api';

        // Add additional request headers
        // options.headers = {
        // ...(options.headers || {}),
        // key1: 'value1',
        // }

        // Add additional request parameters (brought to the request link)
        // options.params = {
        // ...(options.params || {}),
        // key2: 'value2',
        // };

        // Add additional request parameters (brought to the request body)
        // options.data = {
        //     ...(options.data || {}),
        //     key3: 'value3',
        // }
    },
});
