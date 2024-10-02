import { formatISO } from "date-fns";
import momentTZ from "moment-timezone";
import moment from "moment";

import { getAppTimezone, safeNewDate } from "../utils";
import Config from "../../config";

function tryJSONParse(str) {
  let result;

  try {
    result = JSON.parse(str);
  } catch (e) {}

  return result;
}

export const typeDefinitionMap = new Map();
const typeMap = new Map();

// Generate typeKey
export function genSortedTypeKey(typeAnnotation) {
  const { typeKind, typeNamespace, typeName, typeArguments, properties } =
    typeAnnotation || {};
  const typeKeyArr = [];
  if (typeKind === "union") {
    // Union type
    if (Array.isArray(typeArguments)) {
      // Sort by each specific item returned
      const childTypeArgs = typeArguments
        .map((typeArg) => genSortedTypeKey(typeArg))
        .sort((name1, name2) => (name1 > name2 ? 1 : -1));
      typeKeyArr.push(childTypeArgs.join(" | "));
    }
  } else if (typeKind === "anonymousStructure") {
    // Anonymous data structure
    typeKeyArr.push("{");
    if (Array.isArray(properties)) {
      // Sort by key of anonymous data structure
      const childTypeArgs = properties
        .sort(({ name: name1 }, { name: name2 }) => (name1 > name2 ? 1 : -1))
        .map((typeArg) => {
          const { name: typeArgName, typeAnnotation: typeArgTypeAnnotation } =
            typeArg || {};
          return `${typeArgName}: ${genSortedTypeKey(typeArgTypeAnnotation)}`;
        });
      typeKeyArr.push(childTypeArgs.join(", "));
    }
    typeKeyArr.push("}");
  } else {
    const typeArr = [];
    typeNamespace && typeArr.push(typeNamespace);
    typeName && typeArr.push(typeName);
    const typeKey = typeArr.join(".");
    typeKey && typeKeyArr.push(typeKey);
    if (typeKind === "generic") {
      typeKeyArr.push("<");
      if (Array.isArray(typeArguments)) {
        // The order defined by typeArguments must be followed, otherwise the actual parameters are in the wrong position
        const childTypeArgs = typeArguments.map((typeArg) =>
          genSortedTypeKey(typeArg)
        );
        typeKeyArr.push(childTypeArgs.join(", "));
      }
      typeKeyArr.push(">");
    }
  }
  return typeKeyArr.join("");
}

// Generate constructor
function genConstructor(typeKey, definition, genInitFromSchema) {
  if (typeMap[typeKey]) {
    return typeMap[typeKey];
  } else {
    typeDefinitionMap[typeKey] = definition;
    const { typeKind, typeNamespace, typeName, typeArguments, properties } =
      definition || {};
    let propList = properties;
    if (typeKind === "generic") {
      // List and Map belong to special types
      if (
        typeNamespace === "nasl.collection" &&
        ["List", "Map"].includes(typeName)
      ) {
        return;
      }
      const typeArr = [];
      typeNamespace && typeArr.push(typeNamespace);
      typeName && typeArr.push(typeName);
      const genericTypeKey = typeArr.join(".");
      // Generic definition
      const genericDefinition = typeDefinitionMap[genericTypeKey];
      if (genericDefinition) {
        const { typeParams, properties } = genericDefinition || {};
        if (Array.isArray(properties)) {
          // Replace formal parameters with actual parameters
          propList = properties.map((property) => {
            const actualProp = {
              ...property,
            };
            const { typeAnnotation } = property || {};
            // Type parameters
            const index = typeParams.findIndex(
              (typeParam) => typeParam?.name === typeAnnotation?.typeName
            );
            if (index !== -1) {
              actualProp.typeAnnotation = typeArguments[index];
            }
            return actualProp;
          });
        }
      }
    }
    let code = `
            const level = params.level;
            const defaultValue = params.defaultValue;
            // The default value is an object
            if (defaultValue && Object.prototype.toString.call(defaultValue) === '[object Object]') {
                Object.assign(this, defaultValue);
            }
        `;
    if (Array.isArray(propList)) {
      propList.forEach((property) => {
        const {
          name: propertyName,
          typeAnnotation,
          defaultCode,
        } = property || {};
        const defaultValue = defaultCode?.code;
        // const defaultValue = property.defaultCode;
        const defaultValueType = Object.prototype.toString.call(defaultValue);
        const typeKey = genSortedTypeKey(typeAnnotation);
        const typeDefinition = typeDefinitionMap[typeKey];
        const { concept } = typeDefinition || {};
        let parsedValue = defaultValue;
        // Set it to null to clear the value to the backend synchronously, but null is a special state for the checkbox component
        if (typeKey === "nasl.core.Boolean") {
          parsedValue = defaultValue ?? undefined;
        }
        if (
          defaultValueType === "[object String]" &&
          !["nasl.core.String", "nasl.core.Text", "nasl.core.Email"].includes(
            typeKey
          ) &&
          concept !== "Enum" &&
          !["union"].includes(typeKind)
        ) {
          // Some special cases, special treatment into undefined
          // 1.defaultValue is incorrectly assigned to an empty string on the nasl node
          if ([""].includes(defaultValue)) {
            parsedValue = undefined;
          } else {
            parsedValue = tryJSONParse(defaultValue) ?? defaultValue;
          }
        }
        if (
          Object.prototype.toString.call(parsedValue) === "[object String]" &&
          !defaultCode?.executeCode
        ) {
          parsedValue = `\`${parsedValue.replace(
            /['"`\\]/g,
            (m) => `\\${m}`
          )}\``;
        }
        const needGenInitFromSchema =
          typeAnnotation &&
          !["primitive", "union"].includes(typeAnnotation.typeKind);
        const sortedTypeKey = genSortedTypeKey(typeAnnotation);
        code += `this.${propertyName} = `;
        if (needGenInitFromSchema) {
          code += `genInitFromSchema('${sortedTypeKey}',`;
        }
        code += `((defaultValue && defaultValue.${propertyName}) === null || (defaultValue && defaultValue.${propertyName}) === undefined) ? ${parsedValue} : defaultValue && defaultValue.${propertyName}`;
        if (needGenInitFromSchema) {
          code += `, level)`;
        }
        code += `;\n`;
      });
    }
    // eslint-disable-next-line no-new-func
    const fn = Function("genInitFromSchema", "params", code).bind(
      null,
      genInitFromSchema
    );

    //fn sets name
    Object.defineProperty(fn, "name", {
      value: "NaslTypeConstructor",
    });
    
    typeMap[typeKey] = fn;
    return fn;
  }
}

// Initialize the constructor of the entire application
export function initApplicationConstructor(dataTypesMap, genInitFromSchema) {
  if (dataTypesMap) {
    for (const typeKey in dataTypesMap) {
      genConstructor(typeKey, dataTypesMap[typeKey], genInitFromSchema);
    }
  }
}

// Determine the specific type of the string
function judgeStrType(str) {
  const regMap = {
    "nasl.core.Date": /^\d{1,4}(\/|-)\d{1,2}(\/|-)\d{1,2}$/,
    "nasl.core.Time": /^(\d{1,2})(:\d{1,2})?:(\d{1,2})$/,
    "nasl.core.DateTimeReg":
      /^\d{1,4}(\/|-)\d{1,2}(\/|-)\d{1,2}\s(\d{1,2})(:\d{1,2})?:(\d{1,2})$/,
    "nasl.core.Email": /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
  };
  for (const key in regMap) {
    const reg = regMap[key];
    if (reg.test(str)) {
      return key;
    }
  }
}

// Determine whether the variable is of type
export function isInstanceOf(variable, typeKey) {
  const typeConstructor = typeMap[typeKey];
  const typeDefinition = typeDefinitionMap[typeKey];
  const varStr = Object.prototype.toString.call(variable);
  const { concept, typeKind, typeNamespace, typeName, typeArguments } =
    typeDefinition || {};
  const isPrimitive = isDefPrimitive(typeKey);
  if (typeKind === "union") {
    let matchedIndex = -1;
    if (Array.isArray(typeArguments)) {
      matchedIndex = typeArguments.findIndex((typeArg) =>
        isInstanceOf(variable, genSortedTypeKey(typeArg))
      );
    }
    return matchedIndex !== -1;
  } else if (concept === "Enum") {
    // Enumeration
    const { enumItems } = typeDefinition;
    if ( Array . isArray ( enumItems )) {
      if (varStr === "[object String]") {
        // The current value exists in the enumeration
        // Enumeration values   support integer, change to non-strict judgment
        const enumItemIndex = enumItems.findIndex(
          (enumItem) => variable == enumItem.value
        );
        return enumItemIndex !== -1;
      } else if (varStr === "[object Array]") {
        const enumItemIndex = variable.findIndex(
          (varItem) =>
            !isInstanceOf(varItem.value, genSortedTypeKey(typeDefinition))
        );
        // The current enumeration array exactly matches the definition
        return enumItemIndex === -1;
      }
    }
  } else if (isPrimitive) {
    // Basic type
    if (varStr === "[object String]") {
      const actualStrType = judgeStrType(variable);
      if (actualStrType) {
        return actualStrType === typeKey;
      } else if (["nasl.core.String", "nasl.core.Binary"].includes(typeKey)) {
        return true;
      }
    } else if (
      varStr === "[object Number]" &&
      ["nasl.core.Long", "nasl.core.Decimal"].includes(typeKey)
    ) {
      return true;
    } else if (
      varStr === "[object Boolean]" &&
      typeKey === "nasl.core.Boolean"
    ) {
      return true;
    }
  } else if (typeKind === "generic" && typeNamespace === "nasl.collection") {
    if (
      !(
        (typeName === "List" && varStr === "[object Array]") ||
        (typeName === "Map" && varStr === "[object Object]")
      )
    ) {
      return false;
    }
    //Special type List/Map
    let keyChecked = true;
    // Expected value type
    const valueTypeArg =
      typeName === "List" ? typeArguments?.[0] : typeArguments?.[1];
    // There is a situation where the Map key type verification fails the verification
    if (typeName === "Map") {
      // Expected key type
      const keyTypeArg = typeArguments?.[0];
      for (const key in variable) {
        if (!isInstanceOf(key, genSortedTypeKey(keyTypeArg))) {
          keyChecked = false;
        }
      }
    }
    // key verification passed, then check whether the value meets the requirements
    if (keyChecked) {
      if (typeName === "List" && Array.isArray(variable)) {
        const failedIndex = variable.findIndex(
          (varItem) => !isInstanceOf(varItem, genSortedTypeKey(valueTypeArg))
        );
        // The current array is empty or matches the definition exactly
        return variable.length === 0 || failedIndex === -1;
      } else if (typeName === "Map" && variable) {
        let checked = true;
        for (const key in variable) {
          const varItem = variable[key];
          if (!isInstanceOf(varItem, genSortedTypeKey(valueTypeArg))) {
            checked = false;
          }
        }
        return checked;
      }
    }
  } else if (typeConstructor && variable instanceof typeConstructor) {
    return true;
  }
  return false;
}

// Whether the type definition belongs to the basic type
const isDefPrimitive = (typeKey) =>
  [
    "nasl.core.Boolean",
    "nasl.core.Long",
    "nasl.core.Decimal",
    "nasl.core.String",
    "nasl.core.Text",
    "nasl.core.Binary",
    "nasl.core.Date",
    "nasl.core.Time",
    "nasl.core.DateTime",
    "nasl.core.Email",
  ].includes(typeKey);

// Whether the type definition belongs to the string category
export const isDefString = (typeKey) =>
  [
    "nasl.core.String",
    "nasl.core.Text",
    "nasl.core.Binary",
    "nasl.core.Date",
    "nasl.core.Time",
    "nasl.core.DateTime",
    "nasl.core.Email",
  ].includes(typeKey);

// Whether the type definition belongs to the digital category
export const isDefNumber = (typeKey) =>
  ["nasl.core.Long", "nasl.core.Decimal"].includes(typeKey);

// Whether the type definition belongs to an array
export const isDefList = (typeDefinition) => {
  const { typeKind, typeNamespace, typeName } = typeDefinition || {};
  return (
    typeKind === "generic" &&
    typeNamespace === "nasl.collection" &&
    typeName === "List"
  );
};

// Whether the type definition belongs to Map
export const isDefMap = (typeDefinition) => {
  const { typeKind, typeNamespace, typeName } = typeDefinition || {};
  return (
    typeKind === "generic" &&
    typeNamespace === "nasl.collection" &&
    typeName === "Map"
  );
};

// Is the value of a basic type?
// Number, string, boolean, undefined, null, object
const isValPrimitive = (value) => {
  const typeStr = Object.prototype.toString.call(value);
  return ["[object Boolean]", "[object Number]", "[object String]"].includes(
    typeStr
  );
};

/**
 * Check if the type matches
 * @param {*} typeAnnotation expected type
 * @param {*} value
 */
const isTypeMatch = (typeKey, value) => {
  const isPrimitive = isDefPrimitive(typeKey); // type string
  const typeAnnotation = typeDefinitionMap[typeKey];
  const isValuePrimitive = isValPrimitive(value); // type string
  const typeStr = Object.prototype.toString.call(value);
  const { concept } = typeAnnotation || {};
  let isMatch = 
    isPrimitive === isValuePrimitive ||
    (concept === "Enum" && typeStr === "[object String]");
  // Continue to make in-depth judgments based on the large type matching
  if (isMatch) {
    if (isPrimitive) {
      if (
        (typeKey === "nasl.core.Boolean" && typeStr !== "[object Boolean]") ||
        (isDefNumber(typeKey) && typeStr !== "[object Number]") ||
        (isDefString(typeKey) && typeStr !== "[object String]")
      ) {
        isMatch = false;
      }
    }
  }
  return isMatch;
};

/**
 * Initialize variables
 * Basic types no longer enter initialization methods
 * @param {*} typeKey
 * @param {*} defaultValue
 * @param {*} parentLevel
 * @returns
 */
export const genInitData = (typeKey, defaultValue, parentLevel?) => {
  // The instantiated value is returned directly
  if (isInstanceOf(defaultValue, typeKey)) {
    return defaultValue;
  }
  let level = 1;
  if (parentLevel !== undefined) {
    level = parentLevel + 1;
  }
  const defaultValueType = Object.prototype.toString.call(defaultValue);
  let parsedValue = defaultValue;
  // Set it to null to clear the value to the backend synchronously, but null is a special state for the checkbox component
  if (typeKey === "nasl.core.Boolean") {
    parsedValue = defaultValue ?? undefined;
  }
  const typeDefinition = typeDefinitionMap[typeKey];
  const {
    concept,
    typeKind,
    typeNamespace,
    typeName,
    typeArguments,
    properties,
  } = typeDefinition || {};
  if (
    defaultValueType === "[object String]" &&
    !["nasl.core.String", "nasl.core.Text", "nasl.core.Email"].includes(
      typeKey
    ) &&
    concept !== "Enum" &&
    !["union"].includes(typeKind)
  ) {
    // Some special cases, special treatment into undefined
    // 1.defaultValue is incorrectly assigned to an empty string on the nasl node
    if ([""].includes(defaultValue)) {
      parsedValue = undefined;
    } else {
      parsedValue =
        tryJSONParse(defaultValue) !== undefined
          ? tryJSONParse(defaultValue)
          : defaultValue;
    }
  }
  if (level > 2 && [undefined, null].includes(parsedValue)) {
    return;
  }
  
  // The type under nasl.interface cannot be constructed through the constructor, so it is returned directly
  if (typeKey?.startsWith?.('nasl.interface.')) {
    return parsedValue;
  }
  const isTypeMatched =
    parsedValue === undefined || isTypeMatch(typeKey, parsedValue);
  if (isTypeMatched) {
    if (
      typeKind === "generic" &&
      typeNamespace === "nasl.collection" &&
      ["List", "Map"].includes(typeName)
    ) {
      //Special type List/Map
      let initVal = typeName === "List" ? [] : {};
      if (parsedValue) {
        // valueTypeAnnotation may be empty in some cases, so the overall fault tolerance judgment of the typeArguments array cannot be added
        const valueTypeAnnotation =
          typeName === "List" ? typeArguments?.[0] : typeArguments?.[1];
        const sortedTypeKey = genSortedTypeKey(valueTypeAnnotation);
        if (typeName === "List" && Array.isArray(parsedValue)) {
          initVal = parsedValue.map((item) =>
            genInitData(sortedTypeKey, item, level)
          );
        } else if (typeName === "Map") {
          for (const key in parsedValue) {
            const val = parsedValue[key];
            initVal[key] = genInitData(sortedTypeKey, val, level);
          }
        }
      }
      return initVal;
    }
    if (typeName === "DateTime" && parsedValue !== undefined) {
      if (parsedValue instanceof Date) {
        parsedValue = moment(new Date()).format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      }
      return parsedValue;
    } else if (typeKey) {
      const TypeConstructor = typeMap[typeKey];
      if (
        TypeConstructor &&
        !["primitive", "union"].includes(typeKind) &&
        concept !== "Enum"
      ) {
        if (
          concept === "Structure" &&
          Object.prototype.toString.call(parsedValue) === "[object Object]"
        ) {
          parsedValue = jsonNameReflection(properties, parsedValue);
        }
        const instance = new TypeConstructor({
          defaultValue: parsedValue,
          level,
        });
        return instance;
      }
    }
  }
  if (parsedValue !== undefined) {
    return parsedValue;
  }
};

/**
 * Generate indentation
 * @param tabSize number of indents
 * @returns
 */
function indent(tabSize) {
  return " ".repeat(4 * tabSize);
}

/**
 * Convert variable to string
 * @param {*} variable
 * @param {*} typeKey
 * @param {*} timeZone
 * @param {*} tabSize
 * @param {Set} collection The processed objects collected
 * @returns
 */
export const toString = (
  typeKey,
  variable,
  tz?,
  tabSize = 0,
  collection = new Set()
) => {
  if (variable instanceof Error) {
    return variable;
  }
  // null or undefined returns "(empty)"
  if ([undefined, null].includes(variable) || typeKey === "nasl.core.Null") {
    // null
    if (tabSize > 0) {
      return "（空）";
    } else {
      return "";
    }
  }
  let str = "";
  const isPrimitive = isDefPrimitive(typeKey);
  if (isPrimitive) {
    // Basic type
    str = "" + variable;
    // >= 8 valid digits, press small e
    if (["nasl.core.Double", "nasl.core.Decimal"].includes(typeKey)) {
      const varArr = str.split(".");
      let count = 0;
      varArr.forEach((varStr) => {
        count += varStr.length;
      });
      const maxLen = 8;
      if (count >= maxLen) {
        // Remove + to keep consistent with the backend
        // str = (+variable)?.toExponential?.().replace?.('e+', 'e');
        str = variable;
      }
    }

    // Date and time processing
    if (typeKey === "nasl.core.Date") {
      str = momentTZ
        .tz(safeNewDate(variable), getAppTimezone(tz))
        .format("YYYY-MM-DD");
    } else if (typeKey === "nasl.core.Time") {
      const timeRegex = /^([01]?\d|2[0-3])(?::([0-5]?\d)(?::([0-5]?\d))? )?$/;
      // Pure time 12:30:00
      if (timeRegex.test(variable)) {
        const match = variable.match(timeRegex);
        const varArr = [];
        const formatArr = [];
        [
          {
            index: 1,
            format: "HH",
          },
          {
            index: 2,
            format: "mm",
          },
          {
            index: 3,
            format: "ss",
          },
        ].forEach(({ index, format }) => {
          const varItem = match[index];
          if (varItem) {
            formatArr.push(format);
          }
          varArr.push(varItem || "00");
        });
        str = momentTZ
          .tz(safeNewDate("2022-01-01 " + varArr.join(":")), getAppTimezone(tz))
          .format(formatArr.join(":"));
      } else {
        str = momentTZ
          .tz(safeNewDate(variable), getAppTimezone(tz))
          .format("HH:mm:ss");
      }
    } else if (typeKey === "nasl.core.DateTime") {
      str = momentTZ
        .tz(safeNewDate(variable), getAppTimezone(tz))
        .format("YYYY-MM-DD HH:mm:ss");
    }
    if (tabSize > 0) {
      if (["nasl.core.String", "nasl.core.Text"].includes(typeKey)) {
        const maxLen = 100;
        const moreThanMax = variable.length > maxLen;
        if (moreThanMax) {
          str = variable.slice(0, maxLen) + "...";
        }
      }
      // Whether it belongs to the string category
      if (isDefString(typeKey)) {
        str = `"${str}"`;
      }
    }
  } else {
    const typeDefinition = typeDefinitionMap[typeKey];
    let {
      concept,
      typeKind,
      typeNamespace,
      typeName,
      typeArguments,
      name,
      properties,
      enumItems,
    } = typeDefinition || {};
    if (typeKind === "union") {
      if (Array.isArray(typeArguments) && typeArguments.length) {
        const typeArg = typeArguments.find((typeArg) =>
          isInstanceOf(variable, genSortedTypeKey(typeArg))
        );
        if (typeArg) {
          str = toString(
            genSortedTypeKey(typeArg),
            variable,
            tz,
            tabSize,
            collection
          ) as string;
        }
      }
    } else if (concept === "Enum") {
      if (Array.isArray(enumItems) && enumItems.length) {
        //Change to non-strict judgment, enumeration value supports numeric type
        const enumItem = enumItems.find(
          (enumItem) => variable == enumItem.value
        );
        if (window.$i18n && window.$global?.i18nInfo?.enabled && enumItem?.label?.i18nKey) {
          str = window.$i18n.t(enumItem.label.i18nKey);
        } else {
          str = enumItem?.label?.value || '';
        }
      }
    } else if (["TypeAnnotation", "Structure", "Entity"].includes(concept)) {
      // Composite type
      if (collection.has(variable)) {
        str = "";
        if (isDefList(typeDefinition)) {
          if (variable.length > 0) {
            str += "[...]";
          } else {
            str += "[]";
          }
        } else if (isDefMap(typeDefinition)) {
          const keys = Object.keys(variable);
          if (keys.length > 0) {
            str += "[... -> ...]";
          } else {
            str += "[->]";
          }
        } else {
          const keys = Object.keys(variable);
          if (name) {
            str += `${name} `;
          }
          if (keys.length > 0) {
            str += "{...}";
          } else {
            str += "{}";
          }
        }
      } else {
        collection.add(variable);

        if (typeKind === "generic" && typeNamespace === "nasl.collection") {
          if (typeName === "List") {
            const itemTypeKey = genSortedTypeKey(typeArguments?.[0]);
            const tmp = variable.map(
              (varItem) =>
                `${indent(tabSize + 1)}${toString(
                  itemTypeKey,
                  varItem,
                  tz,
                  tabSize + 1,
                  collection
                )}`
            );
            const arrStr = tmp.join(",\n");
            if (variable.length) {
              str = `[\n${arrStr}\n${indent(tabSize)}]`;
            } else {
              str = "[]";
            }
          } else if (typeName === "Map") {
            const keys = Object.keys(variable);
            const keyTypeKey = genSortedTypeKey(typeArguments?.[0]);
            const itemTypeKey = genSortedTypeKey(typeArguments?.[1]);
            const arrStr = keys
              .map(
                (key) =>
                  `${indent(tabSize + 1)}${toString(
                    keyTypeKey,
                    key,
                    tz,
                    tabSize + 1,
                    collection
                  )} -> ${toString(
                    itemTypeKey,
                    variable[key],
                    tz,
                    tabSize + 1,
                    collection
                  )}`
              )
              .join(",\n");
            if (keys.length) {
              str = `{\n${arrStr}\n${indent(tabSize)}}`;
            } else {
              str = "{}";
            }
          }
        } else {
          // Handle some cases of generic data structures
          if (typeKind === "generic") {
            const genericTypeKey = `${typeNamespace}.${typeName}`;
            const genericTypeDefinition = typeDefinitionMap[genericTypeKey];
            if (genericTypeDefinition) {
              name = genericTypeDefinition?.name;
              const genericProperties = genericTypeDefinition?.properties || [];
              if (
                Array.isArray(genericTypeDefinition.typeParams) &&
                genericTypeDefinition.typeParams.length
              ) {
                const map = {};
                genericTypeDefinition.typeParams.forEach((typeParam, index) => {
                  const { name } = typeParam || {};
                  map[name] = index;
                });
                properties = genericProperties.map((genericProperty) => {
                  let typeAnnotation = genericProperty?.typeAnnotation;
                  const { typeName } = typeAnnotation || {};
                  const typeParamIndex = map[typeName];
                  if (typeParamIndex !== undefined) {
                    typeAnnotation = typeArguments[typeParamIndex];
                  }
                  return {
                    ...genericProperty,
                    typeAnnotation,
                  };
                });
              }
            }
          }
          let code = "";
          if (name) {
            code += `${name} `;
          }
          code += "{\n";
          if (Array.isArray(properties) && properties.length) {
            code += properties
              .map((property) => {
                const { name: propName, typeAnnotation: propTypeAnnotation } =
                  property || {};
                const propVal = variable[propName];
                const propTypeKey = genSortedTypeKey(propTypeAnnotation);
                const propValStr = toString(
                  propTypeKey,
                  propVal,
                  tz,
                  tabSize + 1,
                  collection
                );
                return `${indent(tabSize + 1)}${propName}: ${propValStr}`;
              })
              .join(",\n");
          }
          code += `\n${indent(tabSize)}}`;
          str = code;
        }
      }
    }
  }
  if (str === "") {
    if (Object.prototype.toString.call(variable) === "[object Object]") {
      if (collection.has(variable)) {
        str = "{...}";
      } else {
        collection.add(variable);

        str = `{\n`;
        const propStr = [];
        for (const key in variable) {
          const propVal = variable[key];
          const propValStr = toString(
            undefined,
            propVal,
            tz,
            tabSize + 1,
            collection
          );
          propStr.push(`${indent(tabSize + 1)}${key}: ${propValStr}`);
        }
        str += propStr.join(",\n");
        str += `\n}`;
      }
    } else {
      str = "" + variable;
    }
  }
  return str;
};

// yyyy-MM-dd HH:mm:ss
// yyyy/MM/dd HH:mm:ss
// yyyy.MM.dd HH:mm:ss

const DataReg =
  /(^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$)|(^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])$)|(^[1-9]\d{3}\.(0[1-9]|1[0-2])\.(0[1-9]|[1-2][0-9]|3[0-1])$)/;
const TimeReg = /^(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
const DateTimeReg =
  /(^[1-9]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$)|^[1-9]\d{3}\/(0[1-9]|1[0-2])\/(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$|^[1-9]\d{3}\.(0[1-9]|1[0-2])\.(0[1-9]|[1-2][0-9]|3[0-1])\s+(20|21|22|23|[0-1]\d):[0-5]\d:[0-5]\d$/;
const FloatNumberReg = /^(-?\d+)(\.\d+)?$/;
// (long) integer
const IntegerReg = /^-?\d+$/;

/**
 * Determine whether the string date is legal
 * yyyy-MM-dd yyyy/MM/dd HH:mm:ss yyyy.MM.dd 3种格式
 * @param {*} dateString
 * @returns
 */
function isValidDate(dateString, reg) {
  if (!reg.test(dateString)) {
    return false;
  }
  // Verify that the date actually exists
  const date = safeNewDate(dateString);
  if (date.toString() === "Invalid Date") {
    return false;
  }
  let splitChar;
  if (dateString.includes("-")) {
    splitChar = "-";
  } else if (dateString.includes("/")) {
    splitChar = "/";
  } else if (dateString.includes(".")) {
    splitChar = ".";
  }
  const [year, month, day] = dateString
    .split(" ")?.[0]
    ?.split(splitChar)
    .map(Number);
  if (
    date.getFullYear() !== year ||
    date.getMonth() + 1 !== month ||
    date.getDate() !== day
  ) {
    return false;
  }
  return true;
}

export const fromString = (variable, typeKey) => {
  const typeDefinition = typeDefinitionMap[typeKey];
  const isPrimitive = isDefPrimitive(typeKey);
  const { typeName } = typeDefinition || {};
  // date
  if (typeName === "DateTime" && isValidDate(variable, DateTimeReg)) {
    const date = safeNewDate(variable);
    const outputDate = formatISO(date, {
      format: "extended",
      // @ts-ignore Ignore it. I don't know why I should pass this.
      fractionDigits: 3,
    });
    return outputDate;
  } else if (typeName === "Date" && isValidDate(variable, DateReg)) {
    return moment(safeNewDate(variable)).format('YYYY-MM-DD');
  } else if (typeName === "Time" && TimeReg.test(variable)) {
    // ???
    return moment(safeNewDate("2022-01-01 " + variable)).format("HH:mm:ss");
  }
  // Floating point number
  else if (
    ["Decimal", "Double"].includes(typeName) &&
    FloatNumberReg.test(variable)
  ) {
    return parseFloat(String(+variable));
  }
  // integer
  else if (
    ["Integer", "Long"].includes(typeName) &&
    IntegerReg.test(variable)
  ) {
    const maxMap = {
      Integer: 2147483647,
      Long: 9223372036854775807,
    };
    const numberVar = +variable;
    if (numberVar < maxMap[typeName] && numberVar > -maxMap[typeName]) {
      return numberVar;
    }
  }
  // Boolean
  else if (typeName === "Boolean") {
    if (["true", "false"].includes(variable)) {
      return JSON.parse(variable);
    }
  }
  toastAndThrowError(`${typeName} is not in the correct format`);
};
export function toastAndThrowError(err) {
  // Global prompt toast
  Config.toast.error(err);
  throw new Error(err);
}

function jsonNameReflection(properties, parsedValue) {
  if (!Array.isArray(properties)) return parsedValue;
  properties.forEach(({ jsonName, name }) => {
    if (
      jsonName === name ||
      jsonName === undefined ||
      jsonName === null ||
      jsonName === ""
    )
      return;
    parsedValue[name] = parsedValue[jsonName];
    delete parsedValue[jsonName];
  });
  return parsedValue;
}