import "@newjersey/njwds/dist/css/styles.css";
import { ThemeProvider } from "@mui/material";
import muiTheme from "../src/lib/muiTheme";
import "../src/styles/main.scss";
import type { Preview } from "@storybook/nextjs-vite";

const preview: Preview = {
  parameters: {
    layout: "centered",
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [(Story) => <ThemeProvider theme={muiTheme}>{Story()}</ThemeProvider>],
};

export default preview;
