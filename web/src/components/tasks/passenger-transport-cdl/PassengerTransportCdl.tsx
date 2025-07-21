import { Task } from "@/lib/types/types";
import { ReactElement } from "react";
import { TaskHeader } from "@/components/TaskHeader";
import { UnlockedBy } from "@/components/tasks/UnlockedBy";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { PassengerTransportCdlQuestion } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdlQuestion";

interface Props {
  task: Task;
}

export const PassengerTransportCdl = (props: Props): ReactElement => {
  const {
    FormFuncWrapper,
    // getInvalidFieldIds,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  // const showAlert = getInvalidFieldIds().length > 0;

  return (
    <>
      <DataFormErrorMapContext.Provider value={formContextState}>
        <div className="flex1 flex-column1 space-between1 min-height-38rem">
          <TaskHeader task={props.task} tooltipText={""} />
          <UnlockedBy task={props.task} />
          <PassengerTransportCdlQuestion
            taskId={props.task.id}
            onSubmit={onSubmit}
            formFuncWrapper={FormFuncWrapper}
          />
        </div>
      </DataFormErrorMapContext.Provider>
    </>
  );
};
