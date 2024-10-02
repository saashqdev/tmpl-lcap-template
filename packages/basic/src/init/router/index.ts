import {
  formatMicroFrontUrl,
  formatMicroFrontRouterPath,
} from "./microFrontUrl";

import Config from '../../config';
import Global from "../../global";

function initRouter() {
    function $destination(...args) {
      Config.router?.destination?.call(this, ...args);
    };

    async function $link (url, target = "_self") {
      let realUrl;
      if (typeof url === "function") {
        realUrl = await url();
      } else if(url?.charAt(0) === "/") {
        $destination(url,target)
        return;
      }else{
        realUrl = url;
      }
      downloadClick(realUrl, target);
    };

    Global.prototype.$destination = function (...args) {
      $destination.call(this, ...args);
    };
    Global.prototype.$link = $link;
    Global.prototype.$formatMicroFrontUrl = formatMicroFrontUrl;
    Global.prototype.$formatMicroFrontRouterPath = formatMicroFrontRouterPath;

    return {
      formatMicroFrontUrl: formatMicroFrontUrl,
      formatMicroFrontRouterPath: formatMicroFrontRouterPath,
      link: $link,
      destination: $destination,
    };
}

function downloadClick(realUrl, target) {
  const a = document.createElement("a");
  a.setAttribute("href", realUrl);
  a.setAttribute("target", target);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
  }, 500);
}

export { 
  initRouter, 
  downloadClick 
};

export * from './microFrontUrl';
