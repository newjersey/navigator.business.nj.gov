import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    globals: {
      "ts-jest": {
        babelConfig: true,
      },
    },
    setupFilesAfterEnv: ["./setupTests.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "@/components/(.*)": "<rootDir>/components/$1",
      "@/display-content/(.*)": "<rootDir>/display-content/$1",
      "@/lib/(.*)": "<rootDir>/lib/$1",
      "@/test/(.*)": "<rootDir>/test/$1",
      "@/pages/(.*)": "<rootDir>/pages/$1",
      "@/roadmaps/(.*)": "<rootDir>/roadmaps/$1",
      "@/shared/(.*)": "<rootDir>/../shared/src/$1",
    },
    preset: "ts-jest",
    transform: {
      "\\.md$": "jest-raw-loader",
      "\\.[jt]sx?$": "babel-jest",
    },
  };
};
