/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
module.exports = {
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    REDIRECT_URL: process.env.REDIRECT_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    COGNITO_WEB_CLIENT_ID: process.env.COGNITO_WEB_CLIENT_ID,
    MYNJ_PROFILE_LINK: process.env.MYNJ_PROFILE_LINK,
    FEATURE_DISABLE_OPERATE: process.env.FEATURE_DISABLE_OPERATE,
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
};
