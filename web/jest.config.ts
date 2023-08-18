import type { Config } from "@jest/types";

const esModules = ["rehype-react", "remark-gfm", "remark-parse", "remark-rehype", "unified"];

export default async (): Promise<Config.InitialOptions> => {
  return {
    coverageReporters: ["json-summary", "text"],
    setupFilesAfterEnv: ["./setupTests.js"],
    testEnvironment: "jsdom",
    testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/cypress/"],
    moduleNameMapper: {
      "\\.(scss|sass|css)$": "identity-obj-proxy",
      "@/components/(.*)": "<rootDir>/src/components/$1",
      "@/contexts/(.*)": "<rootDir>/src/contexts/$1",
      "@/lib/(.*)": "<rootDir>/src/lib/$1",
      "@/test/(.*)": "<rootDir>/test/$1",
      "@/pages/(.*)": "<rootDir>/src/pages/$1",
      "@/styles/(.*)": "<rootDir>/src/styles/$1",
      "@businessnjgovnavigator/shared/(.*)": "<rootDir>/../shared/lib/shared/src/$1",
      "@businessnjgovnavigator/content/(.*)": "<rootDir>/../content/src/$1"
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
                runtime: "automatic"
              }
            }
          }
        }
      ]
    }
  };
};

process.env = Object.assign(process.env, {
  FEATURE_BUSINESS_FLLP: "true",
  FEATURE_BUSINESS_FLP: "true",
  FEATURE_BUSINESS_FLC: "true",
  FEATURE_BUSINESS_FCORP: "true",
  FEATURE_BUSINESS_FNP: "true",
  FEATURE_BUSINESS_NP: "true",
  FEATURE_EXPORT_PDF: "true",
  WEBFLOW_API_TOKEN: 12345678910
});
