import Config from '../../config';

const getErrMessage = (err) => err.msg || err.Message || 'System error, please check the log! ';
const getErrStrack = (err) => err.StackTrace || 'System error, please check the log! ';

type Err = {
    Code?: number | string;
    Message?: string;
}

export default {
    defaults({ config }, err) {
        if (!config.noErrorTip) {
            Config.toast.error('system error');
        }
    },
    500({ config }, err: Err = {}) {
        if (!config.noErrorTip) {
            Config.toast.error(getErrMessage(err), getErrStrack(err));
        }
    },
    501({ config }, err: Err = {}) {
        // When the server is terminated, the front end must also terminate the program.
        if (err.Code === 501 && err.Message === 'abort') {
            throw Error('程序中止');
        }
    },
    400({ config }, err: Err = {}) {
        if (!config.noErrorTip) {
            Config.toast.error(getErrMessage(err), getErrStrack(err));
        }
    },
    401({ config }, err: Err = {}) {
        if (err.Code === 401 && err.Message === 'token.is.invalid') {
            if (window.LcapMicro?.loginFn) {
                window.LcapMicro.loginFn();
                return;
            }
        }
        if (err.Code === 401 && err.Message === 'token.is.invalid') {
            location.href = '/login';
        }
    },
    403({ config }, err: Err = {}) {
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (window.LcapMicro?.loginFn) {
                window.LcapMicro.loginFn();
                return;
            }
        }
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (!config.noErrorTip) {
                Config.toast.error('Login failed, please log in again');
            }
            localStorage.setItem('beforeLogin', JSON.stringify(location));
            location.href = '/login';
        }
    },
    remoteError({ config }, err) {
        if (!config.noErrorTip) {
            Config.toast.error('System error, please check the log!');
        }
    },
    localError({ config }, err) {
        if (!config.noErrorTip) {
            Config.toast.error('System error, please check the log!');
        }
    },
};
