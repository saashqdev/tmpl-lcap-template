import storage from '../utils/storage/localStorage';
import isEmpty from 'lodash/isEmpty';

const ACTION_LOCAL_CACHE_VARIABLE_TYPE = {
  GET: 'get',
  UPDATE: 'update',
  UNDEFINED: 'undefined',
};

// Define a global mixin named visibilityMixin
export const localCacheVariableMixin = {
  beforeMount() {
    this.actionLocalCacheVariable(ACTION_LOCAL_CACHE_VARIABLE_TYPE.GET);
  },
  mounted() {
    const localCacheVariableSet = this.$localCacheVariableSet;
    if (localCacheVariableSet) {
        for (const localCacheVariableKey of localCacheVariableSet) {
            try {
                this.$watch(`$global.frontendVariables.${localCacheVariableKey}`, function(newValue) {
                    storage.set(localCacheVariableKey, newValue, true);
                }, { deep: true });
            } catch (error) {
                console.warn('error: ', error);
            }
        }
    }
  },
  methods: {
    handleVisibilityChange() {
      if (document.hidden && typeof this.actionLocalCacheVariable === 'function') {
        this.actionLocalCacheVariable(ACTION_LOCAL_CACHE_VARIABLE_TYPE.UPDATE);
      }
    },
    actionLocalCacheVariable(type = ACTION_LOCAL_CACHE_VARIABLE_TYPE.UNDEFINED) {
      const localCacheVariableSet = this.$localCacheVariableSet;
      const { frontendVariables } = this.$global;

      for (const localCacheVariableKey of localCacheVariableSet) {
        switch (type) {
          // Get data from localCache
          case ACTION_LOCAL_CACHE_VARIABLE_TYPE.GET:
            {
              const localCacheValue = storage.get(localCacheVariableKey, true);
              // If localCacheValue exists, synchronize to frontendVariables
              if (localCacheValue || typeof localCacheValue === 'boolean' || typeof localCacheValue === 'number' || localCacheValue === '') {
                frontendVariables[localCacheVariableKey] = localCacheValue;
              }
            }

            break;
          // Synchronize the data in frontendVariables to localCache. The trigger time is before the application is destroyed & the application switches to the background.
          case ACTION_LOCAL_CACHE_VARIABLE_TYPE.UPDATE:
            {
              const currentValue = frontendVariables[localCacheVariableKey];

              // Only write non-null values   synchronously to avoid excessive local redundant data
              if (isEmpty(currentValue) && typeof currentValue !== 'boolean' && typeof currentValue !== 'number' && typeof currentValue !== 'object' && currentValue !== '') {
                storage.remove(localCacheVariableKey);
              } else {
                storage.set(localCacheVariableKey, currentValue, true);
              }
            }

            break;

          default:
            console.warn('actionLocalCacheVariable: type is undefined', type);
            break;
        }
      }
    },

  },
};
