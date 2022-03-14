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
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    COGNITO_WEB_CLIENT_ID: process.env.COGNITO_WEB_CLIENT_ID,
    COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
    COGNITO_IDENTITY_POOL_ID: process.env.COGNITO_IDENTITY_POOL_ID,
    AWS_REGION: process.env.AWS_REGION,
    MYNJ_PROFILE_LINK: process.env.MYNJ_PROFILE_LINK,
    CHECK_DEAD_LINKS: process.env.CHECK_DEAD_LINKS,
    FEATURE_DISABLE_FORMATION: process.env.FEATURE_DISABLE_FORMATION,
    FEATURE_DISABLE_CANNABIS: process.env.FEATURE_DISABLE_CANNABIS,
  },
  staticPageGenerationTimeout: 120,
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    config.module.rules.push({
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
    });

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
            from: "node_modules/njwds/dist/img",
            to: "../public/vendor/img",
          },
        ],
      })
    );

    return config;
  },
});
