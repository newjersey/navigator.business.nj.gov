import { UnlockingAlert } from "@/components/tasks/UnlockingAlert";
import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";
import { TaskLink } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  taskLinks: TaskLink[];
  isLoading: boolean;
}

export const UnlockedBy = (props: Props): ReactElement => (
  <UnlockingAlert
    taskLinks={props.taskLinks}
    variant="warning"
    singularText={TaskDefaults.unlockedBySingular}
    pluralText={TaskDefaults.unlockedByPlural}
    className="margin-bottom-3"
    isLoading={props.isLoading}
  />
);
