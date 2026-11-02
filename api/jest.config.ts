/** @jest-config-loader ts-node */

// biome-ignore lint/style/noRestrictedImports: jest.shared is at the repo root, which no api alias covers
import sharedConfig from "../jest.shared";

process.env = Object.assign(process.env, {
  API_BASE_URL: "someurl",
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  transformIgnorePatterns: ["/node_modules/(?!(uuid))"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.m?jsx?$": "@swc/jest",
  },
  displayName: "api",
  testEnvironment: "<rootDir>/test/customNodeEnvironment.ts",
  setupFiles: ["<rootDir>/test/setupFile.ts"],
  setupFilesAfterEnv: [
    "<rootDir>/test/setupJestDynalite.ts",
    "<rootDir>/../shared/src/test/setupRandomSeed.ts",
  ],

  moduleNameMapper: {
    "\\.(html|txt)$": "<rootDir>/test/jestRawLoader.js",
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
  testPathIgnorePatterns: ["<rootDir>/cdk/", "<rootDir>/lib/", "<rootDir>/node_modules/"],
  globalSetup: "<rootDir>/test/globalSetup.ts",
  globalTeardown: "<rootDir>/test/teardownTests.ts",
};
