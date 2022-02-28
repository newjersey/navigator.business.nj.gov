import { TaskProgress } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";
import { Tag } from "./njwds-extended/Tag";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="base" dataTestid="NOT_STARTED" fixedWidth>
      {Config.taskProgress.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="info" dataTestid="IN_PROGRESS" fixedWidth>
      {Config.taskProgress.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="primary" dataTestid="COMPLETED" fixedWidth>
      {Config.taskProgress.COMPLETED}
    </Tag>
  ),
};
