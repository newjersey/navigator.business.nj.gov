module.exports = {
  target: "serverless",
  env: {
    API_BASE_URL: process.env.API_BASE_URL,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
};
