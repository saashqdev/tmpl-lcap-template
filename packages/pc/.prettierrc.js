module.exports = {
    htmlWhitespaceSensitivity: 'ignore',
    // Maximum 200 characters per line
    printWidth: 200,
    // Use 4 spaces for indentation
    tabWidth: 4,
    // Do not use indentation, use spaces instead
    useTabs: false,
    // There needs to be a semicolon at the end of the line
    semi: true,
    // use single quotes
    singleQuote: true,
    // Object keys are quoted only when necessary
    quoteProps: 'as-needed',
    // jsx does not use single quotes, but uses double quotes
    jsxSingleQuote: false,
    // No comma required at the end
    trailingComma: 'es5',
    // Spaces are required at the beginning and end of the braces
    bracketSpacing: true,
    // The back angle brackets of the jsx tag need to be wrapped
    jsxBracketSameLine: false,
    // Arrow functions also need parentheses when they have only one parameter.
    arrowParens: 'always',
    //The formatting scope of each file is the entire content of the file
    rangeStart: 0,
    rangeEnd: Infinity,
    // No need to write @prettier at the beginning of the file
    requirePragma: false,
    // No need to automatically insert @prettier at the beginning of the file
    insertPragma: false,
    // Use default wrapping criteria
    proseWrap: 'preserve',
    // Use lf for newline character
    endOfLine: 'lf',
    bracketSameLine: true
};
