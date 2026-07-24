import { Tag } from "@/components/njwds-extended/Tag";
import { TaskProgress } from "@businessnjgovnavigator/shared";
import { ConfigType } from "@businessnjgovnavigator/shared/contexts";
import { ReactElement } from "react";

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
