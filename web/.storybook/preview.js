import "@newjersey/njwds/dist/css/styles.css";
import muiTheme from "../src/lib/muiTheme.ts";
import "../src/styles/main.scss";

const { ThemeProvider } = require("@mui/material");

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

export const decorators = [(Story) => <ThemeProvider theme={muiTheme}>{Story()}</ThemeProvider>];
