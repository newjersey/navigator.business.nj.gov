import { CircularProgress } from "@mui/material";
import { ReactElement } from "react";

export const LoadingIndicator = (): ReactElement => {
  return (
    <div className="flex flex-justify-center flex-align-center">
      <CircularProgress aria-label="loading indicator" aria-busy={true} />
      <div className="h3-styling" style={{ marginBottom: 0, marginLeft: "1rem" }}>
        Loading...
      </div>
    </div>
  );
};
