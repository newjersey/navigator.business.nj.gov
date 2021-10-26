import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    ...require("ts-jest/jest-preset"),
    verbose: true,
    rootDir: "src",
  };
};
