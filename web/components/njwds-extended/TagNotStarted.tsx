import { ReactElement } from "react";
import { TaskProgressLookup } from "@/display-content/TaskProgressLookup";

export const TagNotStarted = (): ReactElement => {
  return (
    <span className="usa-tag bg-base-lighter text-base text-no-wrap">{TaskProgressLookup.NOT_STARTED}</span>
  );
};
