import { encodeUrl, downloadClick } from '@lcap/core-template';

export function destination(url, target = '_self') {
    if (target === '_self') {
        // Fix the problem that the jump may fail when the access path is the default home page /
        if (url.startsWith('http')) {
            location.href = encodeUrl(url);
        } else {
            // Handle the problem of invalid anchor jump on the same page
            const beforeHashUrl = url.slice(0, url.indexOf('#'));
            if (url.indexOf('#') !== -1 && beforeHashUrl.indexOf(location.pathname) !== -1) {
                const hash = url.slice(url.indexOf('#'))?.replace('#', '');
                if (document.getElementById(hash)) {
                    document.getElementById(hash).scrollIntoView();
                }
                this.$router.push(url);
            }

            this.$router.push(url);
        }
    } else {
        downloadClick(url, target);
    }
}
