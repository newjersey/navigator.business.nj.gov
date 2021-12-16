import { TaskProgressLookup } from "@/display-defaults/TaskProgressLookup";
import { TaskProgress } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { Tag } from "./njwds-extended/Tag";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="base" dataTestid="NOT_STARTED" fixedWidth>
      {TaskProgressLookup.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="info" dataTestid="IN_PROGRESS" fixedWidth>
      {TaskProgressLookup.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="primary" dataTestid="COMPLETED" fixedWidth>
      {TaskProgressLookup.COMPLETED}
    </Tag>
  ),
};
