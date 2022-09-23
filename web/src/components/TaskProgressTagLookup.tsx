import { Tag } from "@/components/njwds-extended/Tag";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { TaskProgress } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="notStarted" dataTestid="NOT_STARTED" fixedWidth>
      {Config.taskProgress.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="inProgress" dataTestid="IN_PROGRESS" fixedWidth>
      {Config.taskProgress.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="completed" dataTestid="COMPLETED" fixedWidth>
      {Config.taskProgress.COMPLETED}
    </Tag>
  ),
};
