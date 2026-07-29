import { CmsUserDataProvider } from "@/lib/cms/helpers/CmsUserDataProvider";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { ThemeProvider } from "@mui/material";
import { ReactElement } from "react";
import muiTheme from "../../muiTheme";

type ReturnType = (props: PreviewProps) => ReactElement;

export const applyTheme = (child: ReturnType): ReturnType => {
  // eslint-disable-next-line react/display-name
  return (props: PreviewProps): ReactElement => {
    return (
      <ThemeProvider theme={muiTheme}>
        <CmsUserDataProvider>{child(props)}</CmsUserDataProvider>
      </ThemeProvider>
    );
  };
};
