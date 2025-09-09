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
};
