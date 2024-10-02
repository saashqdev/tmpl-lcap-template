import { processInitService } from '@lcap/core-template';
import authService from '../auth/authService';

let user;
export default {
    async getTasks(param = {}) {
        const userInfo = await authService.getUserInfo() || {};
        user = userInfo.UserName;
        const { query } = param;
        const res = await processInitService().getTasks({
            query: {
                ...query,
                user,
            },
        });
        return res;
    },
    async claimTask(param = {}) {
        const { path = {} } = param;
        const res = await processInitService().claimTask({
            path: { ...path },
            body: {
                user,
            },
        });
        return res;
    },
    async getDestinationUrl(param = {}) {
        const { path: { id } } = param;
        const res = await processInitService().getDestinationUrl({
            path: { id },
            query: {
                user,
            },
        });
        return res;
    },
};
