import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text", "lcov"],
    ...require("jest-dynalite/jest-preset"),
    ...require("ts-jest/jest-preset"),
    moduleNameMapper: {
      "@shared/(.*)": "<rootDir>/../shared/src/$1",
    },
    verbose: true,
    globalSetup: "<rootDir>/src/setupTests.ts",
    globalTeardown: "<rootDir>/src/teardownTests.ts",
  };
};
