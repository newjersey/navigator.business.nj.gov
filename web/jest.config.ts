import type { Config } from "@jest/types";

export default async (): Promise<Config.InitialOptions> => {
  return {
    setupFilesAfterEnv: ["./setupTests.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/"],
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "@/components/(.*)": "<rootDir>/components/$1",
      "@/display-content/(.*)": "<rootDir>/display-content/$1",
      "@/lib/(.*)": "<rootDir>/lib/$1",
      "@/test/(.*)": "<rootDir>/test/$1",
      "@/pages/(.*)": "<rootDir>/pages/$1",
      "@/roadmaps/(.*)": "<rootDir>/roadmaps/$1",
    },
    transform: {
      "\\.md$": "jest-raw-loader",
      "\\.[jt]sx?$": "babel-jest",
    },
  };
};
