import { CircularProgress } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  displayText?: string;
}
export const PageCircularIndicator = (props?: Props): ReactElement<any> => {
  return (
    <div className="margin-top-3 desktop:margin-top-0 padding-top-0 desktop:padding-top-6 padding-bottom-15">
      <div className="flex flex-justify-center flex-align-center" data-testid={"loading"}>
        <CircularProgress aria-label="loading indicator" aria-busy={true} />
        <div className="h3-styling padding-left-2 margin-0-override">
          {props?.displayText ?? "Loading..."}
        </div>
      </div>
    </div>
  );
};
