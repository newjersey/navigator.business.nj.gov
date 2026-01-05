/** @type {import('jest').Config} */
export default {
  transform: {
    "\\.m?[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: true,
          },
          keepClassNames: true,
        },
      },
    ],
  },
  watchPathIgnorePatterns: ["coverage"],
  // Limit parallel execution to reduce resource contention and timing issues
  // 50% workers provides good balance between speed and reliability
  maxWorkers: "50%",
};
