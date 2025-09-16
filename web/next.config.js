/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});
module.exports = withBundleAnalyzer({
  productionBrowserSourceMaps: ["testing", "dev"].includes(process.env.STAGE),
  env: {
    AB_TESTING_EXPERIENCE_B_PERCENTAGE: process.env.AB_TESTING_EXPERIENCE_B_PERCENTAGE,
    ALTERNATE_LANDING_PAGE_URL: process.env.ALTERNATE_LANDING_PAGE_URL ?? "",
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    AWS_REGION: process.env.AWS_REGION,

    BASIC_AUTH_AGENCY_PASSWORD: process.env.BASIC_AUTH_AGENCY_PASSWORD,
    BASIC_AUTH_AGENCY_USERNAME: process.env.BASIC_AUTH_AGENCY_USERNAME,
    BASIC_AUTH_PASSWORD: process.env.BASIC_AUTH_PASSWORD,
    BASIC_AUTH_USERNAME: process.env.BASIC_AUTH_USERNAME,
    CHECK_DEAD_LINKS: process.env.CHECK_DEAD_LINKS,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_WEB_CLIENT_ID: process.env.COGNITO_WEB_CLIENT_ID,
    DEV_ONLY_UNLINK_TAX_ID: process.env.DEV_ONLY_UNLINK_TAX_ID ?? "false",
    DISABLE_GTM: process.env.DISABLE_GTM,
    FEATURE_ABC_ETP_APPLICATION: process.env.FEATURE_ABC_ETP_APPLICATION ?? "false",
    FEATURE_BUSINESS_FLP: process.env.FEATURE_BUSINESS_FLP ?? "false",
    FEATURE_CIGARETTE_LICENSE: process.env.FEATURE_CIGARETTE_LICENSE ?? "false",
    FEATURE_FORMATION_SURVEY: process.env.FEATURE_FORMATION_SURVEY ?? "false",
    FEATURE_LANDING_PAGE_REDIRECT: process.env.FEATURE_LANDING_PAGE_REDIRECT ?? "false",
    FEATURE_LOGIN_PAGE: process.env.FEATURE_LOGIN_PAGE ?? "false",
    FEATURE_MODIFY_BUSINESS_PAGE: process.env.FEATURE_MODIFY_BUSINESS_PAGE ?? "false",
    FEATURE_TAX_CLEARANCE_CERTIFICATE: process.env.FEATURE_TAX_CLEARANCE_CERTIFICATE ?? "false",
    FEATURE_SHOW_REMOVE_BUSINESS: process.env.FEATURE_SHOW_REMOVE_BUSINESS ?? "false",
    GOOGLE_TAG_MANAGER_ID: process.env.GOOGLE_TAG_MANAGER_ID,
    MYNJ_PROFILE_LINK: process.env.MYNJ_PROFILE_LINK,
    OUTAGE_ALERT_CONFIG_URL: process.env.OUTAGE_ALERT_CONFIG_URL,
    REDIRECT_URL: process.env.REDIRECT_URL,
    SHOW_DISABLED_INDUSTRIES: process.env.SHOW_DISABLED_INDUSTRIES ?? "false",
    USE_BASIC_AUTH: process.env.USE_BASIC_AUTH,
    USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH:
      process.env.USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH ?? "false",
    FEATURE_EMPLOYER_RATES: process.env.FEATURE_EMPLOYER_RATES ?? "false",
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
      },
    );

    config.plugins.push(
      new CleanWebpackPlugin({
        dry: false,
        cleanOnceBeforeBuildPatterns: ["../public/vendor"],
        dangerouslyAllowCleanPatternsOutsideProject: true,
      }),
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
      }),
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
