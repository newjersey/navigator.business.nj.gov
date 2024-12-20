import { TaskElement } from "@/components/TaskElement";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { Roadmap, Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { Business } from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

interface Props {
  task: Task;
  business: Business;
  roadmap: Roadmap;
}
export const TaskBody = (props: Props): ReactElement<any> => {
  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = props.business?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
    return templateEval(contentMd, { naicsCode: naicsTemplateValue });
  };

  const updatedTask = {
    ...props.task,
    contentMd: addNaicsCodeData(getModifiedTaskContent(props.roadmap, props.task, "contentMd")),
    callToActionLink: getModifiedTaskContent(props.roadmap, props.task, "callToActionLink"),
    callToActionText: getModifiedTaskContent(props.roadmap, props.task, "callToActionText"),
  };

  return <TaskElement task={updatedTask}>{<UnlockedBy task={props.task} />}</TaskElement>;
};
