import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text"],
    reporters: ["default", "jest-junit"],
    // eslint-disable-next-line unicorn/prefer-module
    ...require("ts-jest/jest-preset"),
    verbose: true,
    rootDir: "src",
  };
};
