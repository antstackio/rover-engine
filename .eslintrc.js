module.exports = {
  env: {
    es2021: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "prettier",
    "plugin:eslint-plugin/recommended",
    "plugin:@typescript-eslint/recommended",
  ],

  overrides: [],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json"],
  },
  rules: {
    //"@typescript-eslint/naming-convention": [
    // "error",
    // {
    //   selector: "default",
    //   format: [
    //     "camelCase",
    //     "UPPER_CASE",
    //     "PascalCase",
    //     "snake_case",
    //     //"skewer-case",
    //   ],
    // },
    // {
    //   selector: "variable",
    //   format: ["camelCase"],
    //   types: ["boolean"],
    //   prefix: ["is", "should", "has", "can", "did", "will"],
    // },
    // {
    //   selector: "variableLike",
    //   format: ["camelCase", "UPPER_CASE", "PascalCase"],
    // },
    // ],
  },
  ignorePatterns: ["**/*.js", "**/*.d.ts"],
};
