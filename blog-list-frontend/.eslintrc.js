module.exports = {
  env: {
    browser: true,
    es2021: true,
    "jest/globals": true,
    "cypress/globals": true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  overrides: [],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: "module",
  },

  plugins: ["react", "jest", "cypress"],
  rules: {
    "react/prop-types": "error", // Enable prop-types validation
    "react/react-in-jsx-scope": "error", // Ensure 'React' is in scope when using JSX
    "react/display-name": "off", // Disable missing display name warning
  },
};
