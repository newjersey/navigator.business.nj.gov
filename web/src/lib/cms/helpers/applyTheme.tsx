import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { createTheme, ThemeProvider } from "@mui/material";

type ReturnType = (props: PreviewProps) => JSX.Element;

export const applyTheme = (child: ReturnType): ReturnType => {
  // eslint-disable-next-line react/display-name
  return (props: PreviewProps): JSX.Element => {
    return <ThemeProvider theme={createTheme()}>{child(props)}</ThemeProvider>;
  };
};
