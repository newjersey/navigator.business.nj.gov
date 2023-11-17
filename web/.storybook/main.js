import { dirname, join } from "path";

const path = require("path");

module.exports = {
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-essentials"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("storybook-addon-pseudo-states"),
    getAbsolutePath("@storybook/addon-interactions"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs"),
    options: {},
  },
  core: {
    builder: {
      name: "@storybook/builder-webpack5",
      options: {
        fsCache: true,
        lazyCompilation: true,
      },
    },
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
      "@businessnjgovnavigator/shared": path.resolve(__dirname, "../../shared/lib/shared/src"),
      "@/test": path.resolve(__dirname, "../test"),
    };
    return config;
  },
  features: {
    emotionAlias: false,
    interactionsDebugger: true,
  },
  staticDirs: ["../public"],
};

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}
