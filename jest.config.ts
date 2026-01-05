import sharedConfig from "./jest.shared";

/** @type {import('jest').Config} */
export default {
  ...sharedConfig,
  projects: ["<rootDir>/api", "<rootDir>/shared", "<rootDir>/web"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./coverage/test_results",
        outputName: "jest.xml",
        uniqueOutputName: "false",
        addFileAttribute: "true",
      },
    ],
  ],
  testTimeout: 20000,
  // Reduce parallel workers to prevent resource contention in React 19 async operations
  maxWorkers: "75%",
};
