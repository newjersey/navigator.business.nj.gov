import { Tag } from "@/components/njwds-extended/Tag";
import { getMergedConfig } from "@/contexts/configContext";
import { TaskProgress } from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

const Config = getMergedConfig();

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement<any>> = {
  NOT_STARTED: (
    <Tag backgroundColor="base-lighter" dataTestid="NOT_STARTED" isFixedWidth>
      {Config.taskProgress.NOT_STARTED}
    </Tag>
  ),
  IN_PROGRESS: (
    <Tag backgroundColor="accent-cool-lighter-lighttext" dataTestid="IN_PROGRESS" isFixedWidth>
      {Config.taskProgress.IN_PROGRESS}
    </Tag>
  ),
  COMPLETED: (
    <Tag backgroundColor="primary-lightest" dataTestid="COMPLETED" isFixedWidth>
      {Config.taskProgress.COMPLETED}
    </Tag>
  ),
};
