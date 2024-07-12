import sharedConfig from "../jest.shared";

const esModules = ["rehype-react", "remark-gfm", "remark-parse", "remark-rehype", "unified"];

process.env = Object.assign(process.env, {
  FEATURE_BUSINESS_FLP: "true",
  WEBFLOW_API_TOKEN: 12345678910,
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "web",
  setupFilesAfterEnv: ["./setupTests.js"],
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
  rootDir: "./",
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleNameMapper: {
    "\\.(scss|sass|css)$": "identity-obj-proxy",
    "@/components/(.*)": "<rootDir>/src/components/$1",
    "@/contexts/(.*)": "<rootDir>/src/contexts/$1",
    "@/lib/(.*)": "<rootDir>/src/lib/$1",
    "@/test/(.*)": "<rootDir>/test/$1",
    "@/pages/(.*)": "<rootDir>/src/pages/$1",
    "@/styles/(.*)": "<rootDir>/src/styles/$1",
    "@businessnjgovnavigator/shared/(.*)": "<rootDir>/../shared/lib/shared/src/$1",
    "@businessnjgovnavigator/content/(.*)": "<rootDir>/../content/src/$1",
  },
  resolver: `${__dirname}/test/resolver.js`,
  transformIgnorePatterns: [`<rootDir>/node_modules/(?!(${esModules.join("|")}))`],
  transform: {
    "\\.md$": "<rootDir>/test/jest-raw-loader.js",
    "\\.m?[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            react: {
              runtime: "automatic",
            },
          },
        },
      },
    ],
  },
};
