import { createService } from '../../utils/create';
import api from './api';

const initService = () => createService(api);

export {
    initService,
};
