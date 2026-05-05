// eslint-disable-next-line no-restricted-imports
import sharedConfig from "../../jest.shared";

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "api-cdk",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "json", "node"],
  testMatch: ["**/cdk/test/**/*.test.ts"],
  setupFiles: [],
  setupFilesAfterEnv: ["<rootDir>/test/setupSilentBundlingOutput.ts"],
  testEnvironment: "node",
};
