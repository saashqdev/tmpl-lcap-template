import Config from '../../config';

const getErrMessage = (err) => err.msg || err.Message || 'System error, please check the log! ';
const getErrStrack = (err) => err.StackTrace || 'System error, please check the log! ';

export default {
    defaults({ config }, err) {
        if (!config.noErrorTip) {
            Config.Toast.error('system error');
        }
    },
    500({ config }, err = {}) {
        if (!config.noErrorTip) {
            Config.Toast.error(getErrMessage(err), getErrStrack(err));
        }
    },
    501({ config }, err = {}) {
        // When the server is terminated, the front end must also terminate the program.
        if (err.Code === 501 && err.Message === 'abort') {
            throw Error('Program terminated');
        }
    },
    400({ config }, err = {}) {
        if (!config.noErrorTip) {
            Config.Toast.error(getErrMessage(err), getErrStrack(err));
        }
    },
    401({ config }, err = {}) {
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
    403({ config }, err = {}) {
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (window.LcapMicro?.loginFn) {
                window.LcapMicro.loginFn();
                return;
            }
        }
        if (err.Code === 'InvalidToken' && err.Message === 'Token is invalid') {
            if (!config.noErrorTip) {
                Config.Toast.error('Login failed, please log in again');
            }
            localStorage.setItem('beforeLogin', JSON.stringify(location));
            location.href = '/login';
        }
    },
    remoteError({ config }, err) {
        if (!config.noErrorTip) {
            Config.Toast.error('System error, please check the log!');
        }
    },
    localError({ config }, err) {
        if (!config.noErrorTip) {
            Config.Toast.error('System error, please check the log!');
        }
    },
};
