import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { ThemeProvider } from "@mui/material";
import { ReactNode } from "react";
import muiTheme from "../../muiTheme";

type ReturnType = (props: PreviewProps) => ReactNode;

export const applyTheme = (child: ReturnType): ReturnType => {
  // eslint-disable-next-line react/display-name
  return (props: PreviewProps): ReactNode => {
    return <ThemeProvider theme={muiTheme}>{child(props)}</ThemeProvider>;
  };
};
