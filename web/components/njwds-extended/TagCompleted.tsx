import { ReactElement } from "react";
import { TaskProgressLookup } from "@/display-content/TaskProgressLookup";

export const TagCompleted = (): ReactElement => {
  return (
    <span className="usa-tag bg-primary-lighter text-primary-dark text-no-wrap">
      {TaskProgressLookup.COMPLETED}
    </span>
  );
};
