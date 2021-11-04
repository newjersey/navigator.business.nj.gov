import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    setupFilesAfterEnv: ["./setupTests.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "@/components/(.*)": "<rootDir>/components/$1",
      "@/display-defaults/(.*)": "<rootDir>/display-defaults/$1",
      "@/lib/(.*)": "<rootDir>/lib/$1",
      "@/test/(.*)": "<rootDir>/test/$1",
      "@/pages/(.*)": "<rootDir>/pages/$1",
      "@businessnjgovnavigator/shared/(.*)": "<rootDir>/../shared/lib/shared/src/$1",
    },
    //preset: "ts-jest",
    transform: {
      "\\.md$": "jest-raw-loader",
      "\\.[jt]sx?$": "@swc/jest",
    },
  };
};
