import sharedConfig from "../jest.shared";

const esmModulePattern = [
  "@ungap/structured-clone",
  "bail",
  "bcp-47-match",
  "ccount",
  "character-entities[^/]*",
  "character-reference-invalid",
  "comma-separated-tokens",
  "decode-named-character-reference",
  "devlop",
  "direction",
  "entities",
  "escape-string-regexp",
  "hast-[^/]*",
  "hastscript",
  "html-void-elements",
  "html-whitespace-sensitive-tag-names",
  "is-alphabetical",
  "is-alphanumerical",
  "is-decimal",
  "is-hexadecimal",
  "is-plain-obj",
  "longest-streak",
  "markdown-table",
  "mdast-util-[^/]*",
  "micromark[^/]*",
  "parse-entities",
  "parse5",
  "property-information",
  "rehype-[^/]*",
  "remark-[^/]*",
  "space-separated-tokens",
  "stringify-entities",
  "trim-lines",
  "trough",
  "unified",
  "unist-util-[^/]*",
  "vfile[^/]*",
  "web-namespaces",
  "zwitch",
].join("|");

process.env = Object.assign(process.env, {
  FEATURE_BUSINESS_FLP: "true",
  FEATURE_LOGIN_PAGE: "true",
  FEATURE_TAX_CLEARANCE_CERTIFICATE: "true",
  WEBFLOW_API_TOKEN: 12345678910,
  FEATURE_NAICS_INDUSTRY_DETECTION: "true",
  AB_TESTING_EXPERIENCE_B_PERCENTAGE: "0",
});

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  displayName: "web",
  setupFilesAfterEnv: ["./setupTests.js", "<rootDir>/../shared/src/test/setupRandomSeed.ts"],
  testEnvironment: "<rootDir>/test/customJsdomEnvironment.ts",
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
  rootDir: "./",
  moduleDirectories: ["node_modules", "<rootDir>"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "mjs", "json", "node"],
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
  transformIgnorePatterns: [`/node_modules/(?!(${esmModulePattern}))`],
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
