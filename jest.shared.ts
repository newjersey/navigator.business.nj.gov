/** @type {import('jest').Config} */
export default {
  workerIdleMemoryLimit: "1GB",
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
  transformIgnorePatterns: ["/node_modules/(?!(uuid))"],
  watchPathIgnorePatterns: ["coverage"],
};
