import { CircularProgress } from "@mui/material";
import { ReactElement } from "react";

export const LoadingIndicator = (): ReactElement => {
  return (
    <div className="flex flex-justify-center flex-align-center">
      <CircularProgress aria-label="loading indicator" aria-busy={true} />
      <div className="margin-left-2 h3-styling margin-bottom-0">Loading...</div>
    </div>
  );
};
