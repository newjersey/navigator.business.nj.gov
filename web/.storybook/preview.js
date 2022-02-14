require("njwds/dist/css/styles.css");
require("../src/styles/global.scss");
require("../src/styles/members.module.scss");

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  layout: "centered",
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
