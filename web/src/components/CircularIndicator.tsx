import { Heading } from "@/components/njwds-extended/Heading";
import { CircularProgress } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  displayText?: string;
}
export const CircularIndicator = (props?: Props): ReactElement => {
  return (
    <div className="flex flex-justify-center flex-align-center">
      <CircularProgress aria-label="loading indicator" aria-busy={true} />
      <Heading level={0} styleVariant="h3" style={{ marginBottom: 0, marginLeft: "1rem" }}>
        {props?.displayText ?? "Loading..."}
      </Heading>
    </div>
  );
};
