import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text", "lcov"],
    ...require("ts-jest/jest-preset"),
    verbose: true,
    rootDir: "src",
  };
};
