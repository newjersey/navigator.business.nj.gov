import { TaskHeader } from "@/components/TaskHeader";
import { CheckLandPermitsQuestionnaire } from "@/components/tasks/environment-questionnaire/land/CheckLandPermitsQuestionnaire";
import { CheckLandPermitsResults } from "@/components/tasks/environment-questionnaire/land/CheckLandPermitsResults";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  task: Task;
}
export const CheckLandPermits = (props: Props): ReactElement => {
  const { business } = useUserData();

  return (
    <div>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {business?.environmentData?.land?.submitted ? (
        <CheckLandPermitsResults task={props.task} />
      ) : (
        <CheckLandPermitsQuestionnaire task={props.task} />
      )}
    </div>
  );
};
