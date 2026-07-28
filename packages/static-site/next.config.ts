import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { buildLegacyRedirects } from "./domain/redirects/legacyRedirects";

const withNextIntl = createNextIntlPlugin("./domain/i18n/request.ts");
const PACKAGE_ROOT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  reactCompiler: true,
  // TypeScript 7 dropped the compiler API Next.js's internal type-checker uses;
  // this shells out to the tsc CLI instead. Remove once Next.js supports TS7 natively.
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    root: PACKAGE_ROOT_DIRECTORY,
  },
  async redirects() {
    // NEXT_PUBLIC_* is inlined at build time; the redirect table is baked per build.
    // biome-ignore lint/style/noProcessEnv: build-time flag read, consistent with locales.ts.
    const multilingualEnabled = process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED === "true";
    return buildLegacyRedirects(multilingualEnabled);
  },
};

export default withNextIntl(nextConfig);
