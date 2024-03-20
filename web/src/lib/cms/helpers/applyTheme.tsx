import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { ThemeProvider } from "@mui/material";
import muiTheme from "../../muiTheme";

type ReturnType = (props: PreviewProps) => JSX.Element;

export const applyTheme = (child: ReturnType): ReturnType => {
  // eslint-disable-next-line react/display-name
  return (props: PreviewProps): JSX.Element => {
    return <ThemeProvider theme={muiTheme}>{child(props)}</ThemeProvider>;
  };
};
