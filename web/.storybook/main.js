const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/preset-scss",
    "storybook-addon-designs",
    "@storybook/addon-a11y",
    "storybook-addon-pseudo-states",
    "@storybook/addon-interactions"
  ],
  framework: "@storybook/react",
  core: {
    builder: "webpack5"
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "/img": path.resolve(__dirname, "../public/img"),
      "/vendor/img": "@newjersey/njwds/dist/img",
      "/vendor/js": "@newjersey/njwds/dist/js",
      "@/components": path.resolve(__dirname, "../src/components"),
      "@/lib": path.resolve(__dirname, "../src/lib"),
      "@/contexts": path.resolve(__dirname, "../src/contexts"),
      "@/styles": path.resolve(__dirname, "../src/styles"),
      "@/pages": path.resolve(__dirname, "../src/pages"),
      "@businessnjgovnavigator/content": path.resolve(__dirname, "../../content/src"),
      "@businessnjgovnavigator/shared": path.resolve(__dirname, "../../shared/lib/shared/src")
    };
    return config;
  },
  features: {
    emotionAlias: false,
    interactionsDebugger: true
  },
  staticDirs: ["../public"]
};
