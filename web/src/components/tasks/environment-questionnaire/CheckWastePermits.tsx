import { TaskHeader } from "@/components/TaskHeader";
import { CheckWastePermitsQuestionnaire } from "@/components/tasks/environment-questionnaire/CheckWastePermitsQuestionnaire";
import { CheckWastePermitsResults } from "@/components/tasks/environment-questionnaire/CheckWastePermitsResults";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  task: Task;
}
export const CheckWastePermits = (props: Props): ReactElement<any> => {
  const { business } = useUserData();

  return (
    <div>
      <TaskHeader task={props.task} />
      <UnlockedBy task={props.task} />
      {business?.environmentData?.waste?.submitted ? (
        <CheckWastePermitsResults task={props.task} />
      ) : (
        <CheckWastePermitsQuestionnaire task={props.task} />
      )}
    </div>
  );
};
