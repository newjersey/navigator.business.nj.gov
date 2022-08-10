require("../src/styles/main.scss");
require("njwds/dist/css/styles.css");
const { createTheme, ThemeProvider } = require("@mui/material");
const muiTheme = require("../src/lib/muiTheme");

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

export const decorators = [(Story) => <ThemeProvider theme={createTheme(muiTheme)}>{Story()}</ThemeProvider>];
