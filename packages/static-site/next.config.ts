import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./domain/i18n/request.ts");

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
