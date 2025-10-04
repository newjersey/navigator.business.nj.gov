// eslint-disable-next-line no-restricted-imports
import sharedConfig from "../../jest.shared";

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "api-cdk",
  testMatch: ["**/cdk/test/**/*.test.ts"],
  setupFiles: [],
  setupFilesAfterEnv: [],
  testEnvironment: "node",
};
