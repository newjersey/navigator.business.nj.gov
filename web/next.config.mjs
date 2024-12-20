import withBundleAnalyzer from "@next/bundle-analyzer";
import withMDX from "@next/mdx";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyPlugin from "copy-webpack-plugin";
import process from "node:process";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import { remarkCustomDirectives } from "./src/components/remarkCustomDirectives.mjs";

const analyzerConfig = {
  enabled: process.env.ANALYZE === "true",
};

const mdxConfig = {
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkDirective, remarkCustomDirectives],
    rehypePlugins: [],
  },
};

const config = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    REDIRECT_URL: process.env.REDIRECT_URL,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    FEATURE_BUSINESS_FLP: process.env.FEATURE_BUSINESS_FLP ?? "false",
    FEATURE_LANDING_PAGE_REDIRECT: process.env.FEATURE_LANDING_PAGE_REDIRECT ?? "false",
    ALTERNATE_LANDING_PAGE_URL: process.env.ALTERNATE_LANDING_PAGE_URL ?? "",
    COGNITO_WEB_CLIENT_ID: process.env.COGNITO_WEB_CLIENT_ID,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    AWS_REGION: process.env.AWS_REGION,
    MYNJ_PROFILE_LINK: process.env.MYNJ_PROFILE_LINK,
    CHECK_DEAD_LINKS: process.env.CHECK_DEAD_LINKS,
    FEATURE_MODIFY_BUSINESS_PAGE: process.env.FEATURE_MODIFY_BUSINESS_PAGE ?? "false",
    USE_BASIC_AUTH: process.env.USE_BASIC_AUTH,
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    AB_TESTING_EXPERIENCE_B_PERCENTAGE: process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE,
    SHOW_DISABLED_INDUSTRIES: process.env.SHOW_DISABLED_INDUSTRIES ?? "false",
    USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH:
      process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH ?? "false",
    DISABLE_GTM: process.env.DISABLE_GTM,
    OUTAGE_ALERT_CONFIG_URL: process.env.OUTAGE_ALERT_CONFIG_URL,
  },
  staticPageGenerationTimeout: 120,
  webpack: (webpackConfig) => {
    webpackConfig.module.rules.push(
      {
        test: /\.md$/,
        use: "raw-loader",
      },
      {
        test: /\.(ts|tsx)$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: true,
              experimentalWatchApi: true,
              onlyCompileBundledFiles: true,
            },
          },
        ],
      }
    );

    webpackConfig.plugins.push(
      new CleanWebpackPlugin({
        dry: false,
        cleanOnceBeforeBuildPatterns: ["../public/vendor"],
        dangerouslyAllowCleanPatternsOutsideProject: true,
      }),
      new CopyPlugin({
        patterns: [
          {
            from: "../node_modules/@newjersey/njwds/dist/img",
            to: "../public/vendor/img",
          },
          {
            from: "../node_modules/@newjersey/njwds/dist/js",
            to: "../public/vendor/js",
          },
        ],
      })
    );

    return webpackConfig;
  },
  experimental: {
    largePageDataBytes: 1.28 * 1024 * 1024,
  },
  async redirects() {
    return [
      {
        source: "/welcome",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withBundleAnalyzer(analyzerConfig)(withMDX(mdxConfig)(config));
