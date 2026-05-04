import "@newjersey/njwds/dist/css/styles.css";
import { ThemeProvider } from "@mui/material";
import muiTheme from "../src/lib/muiTheme.ts";
import "../src/styles/main.scss";

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
