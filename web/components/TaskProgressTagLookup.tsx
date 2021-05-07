import { TaskProgress } from "@/lib/types/types";
import React, { ReactElement } from "react";
import { TagNotStarted } from "@/components/njwds-extended/TagNotStarted";
import { TagInProgress } from "@/components/njwds-extended/TagInProgress";
import { TagCompleted } from "@/components/njwds-extended/TagCompleted";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: <TagNotStarted />,
  IN_PROGRESS: <TagInProgress />,
  COMPLETED: <TagCompleted />,
};
