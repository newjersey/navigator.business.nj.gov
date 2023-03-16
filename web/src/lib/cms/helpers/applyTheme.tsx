import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { createTheme, ThemeProvider } from "@mui/material";

// eslint-disable-next-line react/display-name
export const applyTheme = (child: (props: PreviewProps) => JSX.Element) => (props: PreviewProps) =>
  <ThemeProvider theme={createTheme()}>{child(props)}</ThemeProvider>;
