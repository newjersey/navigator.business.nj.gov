import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text"],
    reporters: [
      "default",
      [
        "jest-junit",
        {
          outputDirectory: "../coverage/test_results",
          uniqueOutputName: "false",
          outputName: "shared-jest.xml",
          addFileAttribute: "true",
        },
      ],
    ],
    // eslint-disable-next-line unicorn/prefer-module
    ...require("ts-jest/jest-preset"),
    verbose: true,
    rootDir: "src",
  };
};
