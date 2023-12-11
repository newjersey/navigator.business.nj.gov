import type { Config } from "jest";

export default async (): Promise<Config> => {
  return {
    coverageReporters: ["json-summary", "text"],
    ...require("jest-dynalite/jest-preset"),
    ...require("ts-jest/jest-preset"),
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
    reporters: [
      "default",
      [
        "jest-junit",
        {
          outputDirectory: "../coverage/test_results",
          uniqueOutputName: "false",
          outputName: "api-jest.xml",
          addFileAttribute: "true",
        },
      ],
    ],
    verbose: true,
    globalSetup: "<rootDir>/src/setupTests.ts",
    globalTeardown: "<rootDir>/src/teardownTests.ts",
  };
};
