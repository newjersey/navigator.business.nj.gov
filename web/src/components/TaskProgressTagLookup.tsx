import { Tag } from "@/components/njwds-extended/Tag";
import { TaskProgress } from "@businessnjgovnavigator/shared";
import { getMergedConfig } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

const Config = getMergedConfig();

export const TaskProgressTagLookup: Record<TaskProgress, ReactElement> = {
  TO_DO: (
    <Tag backgroundColor="base-lighter" dataTestid="TO_DO" isFixedWidth>
      {Config.taskProgress.TO_DO}
    </Tag>
  ),
  COMPLETED: (
    <Tag backgroundColor="primary-lightest" dataTestid="COMPLETED" isFixedWidth>
      {Config.taskProgress.COMPLETED}
    </Tag>
  ),
};
