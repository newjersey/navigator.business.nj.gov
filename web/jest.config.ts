import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text", "lcov"],
    setupFilesAfterEnv: ["./setupTests.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "@/components/(.*)": "<rootDir>/src/components/$1",
      "@/lib/(.*)": "<rootDir>/src/lib/$1",
      "@/test/(.*)": "<rootDir>/test/$1",
      "@/pages/(.*)": "<rootDir>/src/pages/$1",
      "@/styles/(.*)": "<rootDir>/src/styles/$1",
      "@businessnjgovnavigator/shared/(.*)": "<rootDir>/../shared/lib/shared/src/$1",
      "@businessnjgovnavigator/content/(.*)": "<rootDir>/../content/src/$1",
    },
    transform: {
      "\\.md$": "jest-raw-loader",
      "\\.[jt]sx?$": "@swc/jest",
    },
  };
};
