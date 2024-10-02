/**
 * Underline format -convert-> camel case format
 * @param name original name
 * @return converted name
 */
const kebab2Camel = (name) => name.replace(/(?:^|-)([a-zA-Z0-9])/g, (m, $1) => $1.toUpperCase());

/**
 * CamelCase format -convert->underline format
 * @param name original name
 * @return converted name
 */
const Camel2kebab = (name) => name.replace(/([A-Z]|[0-9]+)/g, (m, $1, offset) => (offset ? '-' : '') + $1.toLowerCase());

export default {
    kebab2Camel,
    Camel2kebab,
};
