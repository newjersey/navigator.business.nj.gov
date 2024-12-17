import { TaskHeader } from "@/components/TaskHeader";
import { EnvQuestionnaire } from "@/components/tasks/environment-questionnaire/EnvQuestionnaire";
import {
  taskIdToMediaArea,
  taskIdToNotApplicableOption,
} from "@/components/tasks/environment-questionnaire/helpers";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { MediaArea, QuestionnaireFieldIds } from "@businessnjgovnavigator/shared/environment";
import { ReactElement } from "react";
import { EnvPermitsResults } from "./EnvPermitsResults";

interface Props {
  task: Task;
}

export const EnvPermit = (props: Props): ReactElement => {
  const { business } = useUserData();
  const mediaArea = taskIdToMediaArea[props.task.id as keyof typeof taskIdToMediaArea] as MediaArea;
  const noSelectionOption = taskIdToNotApplicableOption[
    props.task.id as keyof typeof taskIdToNotApplicableOption
  ] as QuestionnaireFieldIds;
  const submitted = business?.environmentData?.[mediaArea]?.submitted;

  return (
    <div>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {submitted ? (
        <EnvPermitsResults
          taskId={props.task.id}
          mediaArea={mediaArea}
          noSelectionOption={noSelectionOption}
        />
      ) : (
        <EnvQuestionnaire
          taskId={props.task.id}
          mediaArea={mediaArea}
          noSelectionOption={noSelectionOption}
        />
      )}
    </div>
  );
};
