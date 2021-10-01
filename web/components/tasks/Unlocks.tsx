import React, { ReactElement } from "react";
import { UnlockingAlert } from "@/components/tasks/UnlockingAlert";
import { TaskLink } from "@/lib/types/types";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";

interface Props {
  taskLinks: TaskLink[];
  isLoading: boolean;
}

export const Unlocks = (props: Props): ReactElement => (
  <UnlockingAlert
    taskLinks={props.taskLinks}
    variant="info"
    singularText={TaskDefaults.unlocksAlertSingular}
    pluralText={TaskDefaults.unlocksAlertPlural}
    className="margin-top-3 margin-bottom-3"
    isLoading={props.isLoading}
  />
);
