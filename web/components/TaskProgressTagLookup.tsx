import { TaskProgress } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { Tag } from "./njwds-extended/Tag";
import { TaskProgressLookup } from "@/display-defaults/TaskProgressLookup";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="base" dataTestid="NOT_STARTED">
      {TaskProgressLookup.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="info" dataTestid="IN_PROGRESS">
      {TaskProgressLookup.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="primary" dataTestid="COMPLETED">
      {TaskProgressLookup.COMPLETED}
    </Tag>
  ),
};
