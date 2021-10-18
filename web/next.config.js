/* eslint-disable no-undef */
module.exports = {
  target: "serverless",
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    REDIRECT_URL: process.env.REDIRECT_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    COGNITO_WEB_CLIENT_ID: process.env.COGNITO_WEB_CLIENT_ID,
    MYNJ_PROFILE_LINK: process.env.MYNJ_PROFILE_LINK,
    DISABLE_AUTH: process.env.DISABLE_AUTH,
    FEATURE_DISABLE_OPERATE: process.env.FEATURE_DISABLE_OPERATE,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
};
