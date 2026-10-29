import type { TaskProgress } from "@businessnjgovnavigator/shared";
import type { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import type { ReactElement } from "react";
import { Tag } from "@/components/njwds-extended/Tag";

export const getTaskProgressTagLookup = (
  Config: ConfigType,
): Record<TaskProgress, ReactElement> => {
  return {
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
};
