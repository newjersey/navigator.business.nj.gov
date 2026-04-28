import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./domain/i18n/request.ts");
const PACKAGE_ROOT_DIRECTORY = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  reactCompiler: true,
  turbopack: {
    root: PACKAGE_ROOT_DIRECTORY,
  },
};

export default withNextIntl(nextConfig);
