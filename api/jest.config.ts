import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    ...require("jest-dynalite/jest-preset"),
    ...require("ts-jest/jest-preset"),
    verbose: true,
    globalSetup: "<rootDir>/src/setupTests.ts",
    globalTeardown: "<rootDir>/src/teardownTests.ts",
  };
};
