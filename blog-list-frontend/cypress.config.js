// eslint-disable-next-line no-undef
const { defineConfig } = require("cypress");

// eslint-disable-next-line no-undef
module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
  },
  env: {
    BACKEND: "http://localhost:3003/api",
  },
});
