/* For use by mini programs only */

/* Add routing to http */
const getUrl = (url) => url.startsWith('http') ? url : 'http://' + url;

/* Mini program environment */
export const isMiniApp = localStorage.getItem("_wx_is_mini")

/* Route jump */
export const navigateTo = ({ url }) => {
    if (!isMiniApp)
        return;
    const origin = location.origin;
    const detailUrl = encodeURIComponent(`${origin}${url}`);
    const miniUrl = `/pages/index/index?detailUrl=${detailUrl}`;
    window.wx.miniProgram.navigateTo({ url: miniUrl });
};

/* Jump to the avatar nickname page*/
export const navigateToUserInfoPage = () => {
    if (!isMiniApp)
        return;
    const uri = location.href;
    window.wx.miniProgram.navigateTo({ url: `/pages/userinfo/index?redirect_uri=${uri}` });
};

/* Jump to mobile phone number page*/
export const navigateToUserPhonePage = () => {
    if (!isMiniApp)
        return;
    const uri = location.href;
    window.wx.miniProgram.navigateTo({ url: `/pages/userphone/index?redirect_uri=${uri}` });
};

/* Jump to the scan page*/
export const navigateScanCodePage = () => {
    if (!isMiniApp)
        return;
    const uri = location.href;
    window.wx.miniProgram.navigateTo({ url: `/pages/scancode/index?redirect_uri=${uri}` });
};

/* Jump to the positioning page */
export const navigateLocationPage = () => {
    if (!isMiniApp)
        return;
    const uri = location.href;
    window.wx.miniProgram.navigateTo({ url: `/pages/getlocation/index?redirect_uri=${uri}` });
};

