import { UnlockingAlert } from "@/components/tasks/UnlockingAlert";
import { TaskLink } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

interface Props {
  taskLinks: TaskLink[];
  isLoading: boolean;
  dataTestid?: string;
}

export const UnlockedBy = (props: Props): ReactElement => (
  <UnlockingAlert
    taskLinks={props.taskLinks}
    variant="warning"
    singularText={Defaults.taskDefaults.unlockedBySingular}
    pluralText={Defaults.taskDefaults.unlockedByPlural}
    className="margin-bottom-3"
    isLoading={props.isLoading}
    dataTestid={props.dataTestid}
  />
);
