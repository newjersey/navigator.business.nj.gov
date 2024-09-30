import defaultConfig from "./jest.config";

/** @type {import('jest').Config} */
export default {
  ...defaultConfig,
  collectCoverage: true,
  collectCoverageFrom: ["**/*.{js,jsx,ts,tsx,cjs,mjs}", "!**/node_modules/**"],
  coverageDirectory: "./coverage",
  coverageReporters: ["json-summary", "text", "html", "lcov"],
  coveragePathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/public/",
    "<rootDir>/.storybook/",
    "<rootDir>/cypress/",
    "<rootDir>/stories/",
  ],
};
