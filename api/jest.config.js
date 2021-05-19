module.exports = {
  ...require("jest-dynalite/jest-preset"),
  ...require("ts-jest/jest-preset"),
  globalSetup: "<rootDir>/src/setupTests.js",
  globalTeardown: "<rootDir>/src/teardownTests.js",
};
