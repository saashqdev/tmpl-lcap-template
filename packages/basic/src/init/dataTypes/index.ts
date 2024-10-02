import { processPorts } from "../process";

import Config from "../../config";
import Global from "../../global";

import {
  initApplicationConstructor,
  genInitData,
  isInstanceOf,
  genSortedTypeKey,
} from "./tools";
import * as Utils from "./utils";

function initDataTypes(options) {
  const dataTypesMap = options.dataTypesMap || {};
  const i18nInfo = options.i18nInfo || {};
  initApplicationConstructor(dataTypesMap, genInitFromSchema);

  const { frontendVariables, localCacheVariableSet } =
    getFrontendVariables(options);

  const $global = {
    // User information
    userInfo: {},
    // Internationalization information
    i18nInfo: i18nInfo,
    // Front-end global variables
    frontendVariables,

    ...Utils,
    ...(Config.utils || {}),
  };

  Object.keys(processPorts).forEach((service) => {
    $global[service] = processPorts[service];
  });
  window.$global = $global;

  window.$genInitFromSchema = genInitFromSchema;
  Global.prototype.$genInitFromSchema = genInitFromSchema;

  Global.prototype.$global = $global;
  Global.prototype.$localCacheVariableSet = localCacheVariableSet;
  Global.prototype.$isInstanceOf = isInstanceOf;
  // Determine whether two objects are equal, without the reference being exactly the same
  Global.prototype.$isLooseEqualFn = isLooseEqualFn;
  Global.prototype.$resolveRequestData = resolveRequestData;

  const enumsMap = options.enumsMap || {};
  Global.prototype.$enums = (key, value) => {
    if (!key || !value) return "";
    if (enumsMap[key]) {
      return enumsMap[key][value];
    } else {
      return "";
    }
  };

  return {
    $global,
  }
}

function genInitFromSchema(typeKey, defaultValue?, level?) {
  return genInitData(typeKey, defaultValue, level);
}

function getFrontendVariables(options) {
  const frontendVariables = {};
  const localCacheVariableSet = new Set();
  if (Array.isArray(options && options.frontendVariables)) {
    options.frontendVariables.forEach((frontendVariable) => {
      const { name, typeAnnotation, defaultValueFn, defaultCode, localCache } =
        frontendVariable;
      localCache && localCacheVariableSet.add(name); // A collection of locally stored global variables
      let defaultValue = defaultCode?.code;
      if (
        Object.prototype.toString.call(defaultValueFn) === "[object Function]"
      ) {
        defaultValue = defaultValueFn(Global);
      }
      frontendVariables[name] = genInitFromSchema(
        genSortedTypeKey(typeAnnotation),
        defaultValue
      );
    });
  }
  return {
    frontendVariables,
    localCacheVariableSet,
  };
}

function isLooseEqualFn(obj1, obj2, cache = new Map()) {
  // Check if the objects are the same
  if (obj1 === obj2) {
    return true;
  }
  // Whether the objects have been compared to solve the problem of circular dependency
  if (cache.has(obj1) && cache.get(obj1) === obj2) {
    return true;
  }
  // Determine type equality
  if (typeof obj1 !== typeof obj2) {
    return false;
  }
  // Determine whether the array length or the number of object attributes is consistent
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  if (keys1.length !== keys2.length) {
    return false;
  }
  // Add to cache
  cache.set(obj1, obj2);
  // Compare each value in the attribute to see if it is consistent
  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    // recursion
    if (typeof val1 === "object" && typeof val2 === "object") {
      if (!isLooseEqualFn(val1, val2, cache)) {
        return false;
      }
    } else {
      // Determine whether the values   of non-objects are consistent
      if (val1 !== val2) {
        return false;
      }
    }
  }
  return true;
}

// The entity's updateBy and deleteBy need to process the request parameters in advance
function resolveRequestData(root) {
  if (!root) return;
  // console.log(root.concept)
  delete root.folded;

  if (root.concept === "NumericLiteral") {
    // eslint-disable-next-line no-self-assign
    root.value = root.value;
  } else if (root.concept === "StringLiteral") {
    // eslint-disable-next-line no-self-assign
    root.value = root.value;
  } else if (root.concept === "NullLiteral") {
    delete root.value;
  } else if (root.concept === "BooleanLiteral") {
    root.value = root.value === "true";
  } else if (root.concept === "Identifier") {
    parseRequestDataType.call(this, root, "expression");
  } else if (root.concept === "MemberExpression") {
    if (root.expression) {
      parseRequestDataType.call(this, root, "expression");
    }
  }
  resolveRequestData.call(this, root.left);
  resolveRequestData.call(this, root.right);
  return root;
}

// The entity's updateBy and deleteBy need to process the request parameters in advance
function parseRequestDataType(root, _prop) {
  let value;
  try {
    // eslint-disable-next-line no-eval
    value = eval(root[_prop]);
  } catch (err) {
    value = root.value;
  }
  const type = typeof value;
  // console.log('type:', type, value)
  if (type === "number") {
    root.concept = "NumericLiteral";
    root.value = value + "";
  } else if (type === "string") {
    root.concept = "StringLiteral";
    root.value = value;
  } else if (type === "boolean") {
    root.concept = "BooleanLiteral";
    root.value = value;
  } else if (type === "object") {
    if (Array.isArray(value)) {
      const itemValue = value[0];
      if (itemValue !== undefined) {
        const itemType = typeof itemValue;
        root.concept = "ListLiteral";
        if (itemType === "number") {
          root.value = value.map((v) => v + "").join(",");
        } else if (itemType === "string") {
          root.value = value.map((v) => "'" + v + "'").join(",");
        } else if (itemType === "boolean") {
          root.value = value.join(",");
        }
      }
    }
  }
}

export { 
  initDataTypes,
  genInitFromSchema,
  getFrontendVariables,
  isLooseEqualFn,
  resolveRequestData,
  parseRequestDataType,
  Utils,
};

export * as Tools from './tools';