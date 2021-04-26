import { ReactElement } from "react";
import { TaskProgressLookup } from "../../display-content/TaskProgressLookup";

export const TagInProgress = (): ReactElement => {
  return (
    <span className="usa-tag bg-secondary-lighter text-secondary-darker">
      {TaskProgressLookup.IN_PROGRESS}
    </span>
  );
};
