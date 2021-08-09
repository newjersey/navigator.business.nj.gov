module.exports = {
  target: "serverless",
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
    AUTH_DOMAIN: process.env.AUTH_DOMAIN,
    LANDING_PAGE_URL: process.env.LANDING_PAGE_URL,
    GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
  async redirects() {
    return [
      {
        source: "/complete-signup",
        destination: "/complete-signin",
        permanent: false,
      },
    ];
  },
};
