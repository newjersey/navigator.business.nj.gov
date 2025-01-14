/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    REDIRECT_URL: process.env.REDIRECT_URL,
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    FEATURE_BUSINESS_FLP: process.env.FEATURE_BUSINESS_FLP ?? "false",
    FEATURE_LOGIN_PAGE: process.env.FEATURE_LOGIN_PAGE ?? "false",
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
  webpack: (config) => {
    config.module.rules.push(
      {
        test: /\.md$/,
        use: "raw-loader",
      },
      {
        test: /\.(ts)x?$/,
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

    config.plugins.push(
      new CleanWebpackPlugin({
        dry: false,
        cleanOnceBeforeBuildPatterns: ["../public/vendor"],
        dangerouslyAllowCleanPatternsOutsideProject: true,
      })
    );

    config.plugins.push(
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

    return config;
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
});
