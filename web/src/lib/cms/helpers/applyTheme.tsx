import { ThemeProvider } from "@mui/material";
import type { ReactElement } from "react";
import { CmsUserDataProvider } from "@/lib/cms/helpers/CmsUserDataProvider";
import type { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import muiTheme from "../../muiTheme";

type ReturnType = (props: PreviewProps) => ReactElement;

export const applyTheme = (child: ReturnType): ReturnType => {
  return (props: PreviewProps): ReactElement => {
    return (
      <ThemeProvider theme={muiTheme}>
        <CmsUserDataProvider>{child(props)}</CmsUserDataProvider>
      </ThemeProvider>
    );
  };
};
