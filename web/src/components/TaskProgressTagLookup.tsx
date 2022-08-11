import { Tag } from "@/components/njwds-extended/Tag";
import { TaskProgress } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  NOT_STARTED: (
    <Tag tagVariant="base" dataTestid="NOT_STARTED_TAG" fixedWidth>
      {Config.taskProgress.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag tagVariant="info" dataTestid="IN_PROGRESS_TAG" fixedWidth>
      {Config.taskProgress.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag tagVariant="primary" dataTestid="COMPLETED_TAG" fixedWidth>
      {Config.taskProgress.COMPLETED}
    </Tag>
  ),
};
