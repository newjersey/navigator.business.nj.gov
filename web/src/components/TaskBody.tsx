import { TaskElement } from "@/components/TaskElement";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNaicsDisplayMd } from "@/lib/domain-logic/getNaicsDisplayMd";
import { Task } from "@/lib/types/types";
import { templateEval } from "@/lib/utils/helpers";
import { getModifiedTaskContent } from "@/lib/utils/roadmap-helpers";
import { ReactElement } from "react";

interface Props {
  task: Task;
}
export const TaskBody = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { roadmap } = useRoadmap();

  const addNaicsCodeData = (contentMd: string): string => {
    const naicsCode = business?.profileData.naicsCode || "";
    const naicsTemplateValue = getNaicsDisplayMd(naicsCode);
    return templateEval(contentMd, { naicsCode: naicsTemplateValue });
  };

  const updatedTask = {
    ...props.task,
    contentMd: addNaicsCodeData(getModifiedTaskContent(roadmap, props.task, "contentMd")),
    callToActionLink: getModifiedTaskContent(roadmap, props.task, "callToActionLink"),
    callToActionText: getModifiedTaskContent(roadmap, props.task, "callToActionText"),
  };

  return <TaskElement task={updatedTask}>{<UnlockedBy task={props.task} />}</TaskElement>;
};
