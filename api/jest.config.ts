// eslint-disable-next-line no-restricted-imports
import sharedConfig from "../jest.shared";

process.env = Object.assign(process.env, {
  API_BASE_URL: "someurl",
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  ...require("jest-dynalite/jest-preset"),
  ...require("ts-jest/jest-preset"),
  displayName: "api",
  testEnvironment: "<rootDir>/test/customNodeEnvironment.ts",
  setupFiles: ["<rootDir>/test/setupFile.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/test/setupJestDynalite.ts",
    "<rootDir>/../shared/src/test/setupRandomSeed.ts",
  ],

  moduleNameMapper: {
    "@shared/(.*)": "<rootDir>/../shared/src/$1",
    "@domain/(.*)": "<rootDir>/src/domain/$1",
    "@db/(.*)": "<rootDir>/src/db/$1",
    "@client/(.*)": "<rootDir>/src/client/$1",
    "@api/(.*)": "<rootDir>/src/api/$1",
    "@functions/(.*)": "<rootDir>/src/functions/$1",
    "@libs/(.*)": "<rootDir>/src/libs/$1",
    "@test/(.*)": "<rootDir>/test/$1",
    "@wiremock/(.*)": "<rootDir>/wiremock/$1",
    "@scripts/(.*)": "<rootDir>/../scripts/$1",
  },
  testPathIgnorePatterns: ["<rootDir>/lib/", "<rootDir>/node_modules/"],
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/teardownTests.ts",
};
