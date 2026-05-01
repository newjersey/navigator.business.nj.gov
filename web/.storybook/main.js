// This file has been automatically migrated to valid ESM format by Storybook.
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

export default {
  stories: ["../stories/**/*.stories.mdx", "../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-designs"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-docs"),
  ],
  framework: {
    name: getAbsolutePath("@storybook/nextjs-vite"),
    options: {},
  },
  core: {
    builder: {
      name: getAbsolutePath("@storybook/builder-webpack5"),
      options: {
        fsCache: true,
        lazyCompilation: true,
      },
    },
  },
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "/img": resolve(__dirname, "../public/img"),
      "/vendor/img": "@newjersey/njwds/dist/img",
      "/vendor/js": "@newjersey/njwds/dist/js",
      "@/components": resolve(__dirname, "../src/components"),
      "@/lib": resolve(__dirname, "../src/lib"),
      "@/contexts": resolve(__dirname, "../src/contexts"),
      "@/styles": resolve(__dirname, "../src/styles"),
      "@/pages": resolve(__dirname, "../src/pages"),
      "@businessnjgovnavigator/content": resolve(__dirname, "../../content/src"),
      "@businessnjgovnavigator/shared": resolve(__dirname, "../../shared/lib/shared/src"),
      "@/test": resolve(__dirname, "../test"),
    };
    return config;
  },
  features: {
    emotionAlias: false,
    interactionsDebugger: true,
  },
  staticDirs: ["../public"],
};
