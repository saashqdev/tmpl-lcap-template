import { encodeUrl, downloadClick } from '@lcap/core-template';
import { navigateTo,isMiniApp } from '../common/wx';

export function destination(url, target = '_self') {
    if (!url) {
        return
    }
   
    if (target === '_self') {
        // Fix the problem that the jump may fail when the access path is the default home page /
        if (url?.startsWith('http')) {
            location.href = encodeUrl(url)
        } else {
            /* Determine whether it is in the mini program */
            if (isMiniApp) {
                navigateTo({ url });
            } else {
                this.$router.push(url);
            }
        }
    } else {
        if (isMiniApp) {
            navigateTo({ url });
        } else {
            downloadClick(url, target);
        }
    }
}
