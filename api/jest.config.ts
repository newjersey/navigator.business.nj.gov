// eslint-disable-next-line no-restricted-imports
import sharedConfig from "../jest.shared";

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  ...require("jest-dynalite/jest-preset"),
  ...require("ts-jest/jest-preset"),
  displayName: "api",
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
  },
  globalSetup: "<rootDir>/src/setupTests.ts",
  globalTeardown: "<rootDir>/src/teardownTests.ts",
};
