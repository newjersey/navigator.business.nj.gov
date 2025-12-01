import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { TaskHeader } from "@/components/TaskHeader";
import { ManageBusinessVehicleQuestion } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicleQuestion";
import { ManageBusinessVehicleResults } from "@/components/tasks/manage-business-vehicles/ManageBusinessVehicleResults";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@businessnjgovnavigator/shared/types";
import React from "react";

interface Props {
  task: Task;
  CMS_ONLY_disable_error?: boolean;
}

export const ManageBusinessVehicles: React.FC<Props> = (props: Props) => {
  const { Config } = useConfig();
  const { business } = useUserData();

  const {
    getInvalidFieldIds,
    FormFuncWrapper,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  const isRadioSelected = business?.roadmapTaskData?.manageBusinessVehicles !== undefined;

  const showAlert = props.CMS_ONLY_disable_error || getInvalidFieldIds().length > 0;

  return (
    <DataFormErrorMapContext.Provider value={formContextState}>
      <div
        className="flex1 flex-column1 space-between1 min-height-38rem"
        data-testid="manage-business-vehicles-task"
      >
        <TaskHeader task={props.task} tooltipText={Config.manageBusinessVehicles.tooltipText} />
        {showAlert && (
          <Alert variant="error">
            <Content>{Config.manageBusinessVehicles.pageLevelAlertText}</Content>
          </Alert>
        )}

        {isRadioSelected ? (
          <ManageBusinessVehicleResults taskId={props.task.id} />
        ) : (
          <ManageBusinessVehicleQuestion
            formFuncWrapper={FormFuncWrapper}
            taskId={props.task.id}
            onSubmit={onSubmit}
            CMS_ONLY_disable_error={props.CMS_ONLY_disable_error}
          />
        )}
      </div>
    </DataFormErrorMapContext.Provider>
  );
};
