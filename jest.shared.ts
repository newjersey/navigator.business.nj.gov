/** @type {import('jest').Config} */
export default {
  transform: {
    "\\.m?[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          keepClassNames: true,
        },
      },
    ],
  },
  watchPathIgnorePatterns: ["coverage"],
};
