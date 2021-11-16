const path = require("path");
const images = require("njwds/dist/img");

module.exports = {
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    "storybook-addon-designs",
    "storybook-addon-outline",
    "@storybook/addon-a11y",
  ],
  core: {
    builder: "webpack5",
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "/img": path.resolve(__dirname, "../public/img"),
      "/vendor/img": images,
    };
    return config;
  },
};
