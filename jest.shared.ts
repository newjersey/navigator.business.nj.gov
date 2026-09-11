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
  // pnpm resolves every dependency through a nested `node_modules/.pnpm/<name>@<version>/`
  // store, so a plain `/node_modules/(?!(pkg))/` allowlist (written for Yarn's flat,
  // hoisted node_modules) always matches the outer `.pnpm` segment first and never
  // reaches the allow-listed package, silently un-transforming it. Anchor on the
  // `.pnpm/` segment itself and negative-lookahead the package@version directory name.
  transformIgnorePatterns: ["node_modules/\\.pnpm/(?!(uuid)@)"],
  watchPathIgnorePatterns: ["coverage"],
};
