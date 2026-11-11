import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { isHousingDeveloperResourcesEnabled } from "./domain/content/housingDeveloperResourcesFlag";
import { buildLegacyRedirects } from "./domain/redirects/legacyRedirects";

const withNextIntl = createNextIntlPlugin("./domain/i18n/request.ts");
const PACKAGE_ROOT_DIRECTORY = dirname(fileURLToPath(import.meta.url));
const REPOSITORY_ROOT_DIRECTORY = resolve(PACKAGE_ROOT_DIRECTORY, "../..");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  outputFileTracingRoot: REPOSITORY_ROOT_DIRECTORY,
  reactCompiler: true,
  // TypeScript 7 dropped the compiler API Next.js's internal type-checker uses;
  // this shells out to the tsc CLI instead. Remove once Next.js supports TS7 natively.
  experimental: {
    useTypeScriptCli: true,
  },
  turbopack: {
    root: REPOSITORY_ROOT_DIRECTORY,
  },
  async redirects() {
    // NEXT_PUBLIC_* is inlined at build time; the redirect table is baked per build.
    // biome-ignore lint/style/noProcessEnv: build-time flag read, consistent with locales.ts.
    const multilingualEnabled = process.env.NEXT_PUBLIC_MULTILINGUAL_ENABLED === "true";
    return buildLegacyRedirects({
      multilingualEnabled,
      housingDeveloperResourcesEnabled: isHousingDeveloperResourcesEnabled(),
    });
  },
};

export default withNextIntl(nextConfig);
