import { TaskProgress } from "@/lib/types/types";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { Tag } from "./njwds-extended/Tag";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="base" dataTestid="NOT_STARTED" fixedWidth>
      {Defaults.taskProgress.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="info" dataTestid="IN_PROGRESS" fixedWidth>
      {Defaults.taskProgress.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="primary" dataTestid="COMPLETED" fixedWidth>
      {Defaults.taskProgress.COMPLETED}
    </Tag>
  ),
};
