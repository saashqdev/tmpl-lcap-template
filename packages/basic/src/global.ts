import _set from 'lodash/set';

// Constructor used to mock Vue
const GlobalFn = window.Vue || function MockVue() {}

export default GlobalFn;

export const global = new GlobalFn();