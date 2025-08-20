import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { TaskHeader } from "@/components/TaskHeader";
import { PassengerTransportCdlQuestion } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdlQuestion";
import { PassengerTransportCdlResult } from "@/components/tasks/passenger-transport-cdl/PassengerTransportCdlResult";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { isBoolean } from "lodash";
import React, { ReactElement } from "react";

interface Props {
  task: Task;
  CMS_ONLY_show_error?: boolean;
  CMS_ONLY_show_tab_2?: boolean;
  CMS_ONLY_school_bus_radio_value?: boolean;
  CMS_ONLY_passengers_radio_value?: boolean;
}

export const PassengerTransportCdl = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business } = useUserData();
  const [schoolBusRadioValue, setSchoolBusRadioValue] = React.useState<boolean | undefined>(
    business?.roadmapTaskData?.passengerTransportSchoolBus,
  );
  const [passengersRadioValue, setPassengersRadioValue] = React.useState<boolean | undefined>(
    business?.roadmapTaskData?.passengerTransportSixteenOrMorePassengers,
  );

  const {
    FormFuncWrapper,
    getInvalidFieldIds,
    onSubmit,
    state: formContextState,
  } = useFormContextHelper(createDataFormErrorMap());

  const showAlert = props.CMS_ONLY_show_error || getInvalidFieldIds().length > 0;
  const bothInputsAnswered =
    isBoolean(business?.roadmapTaskData?.passengerTransportSchoolBus) &&
    isBoolean(business?.roadmapTaskData?.passengerTransportSixteenOrMorePassengers);

  const showResults = props.CMS_ONLY_show_tab_2 || bothInputsAnswered;

  const fieldnameToConfig: Record<string, string> = {
    passengerTransportSchoolBus: Config.passengerTransportCdlTabOne.firstQuestionAlertFieldNameText,
    passengerTransportSixteenOrMorePassengers:
      Config.passengerTransportCdlTabOne.secondQuestionAlertFieldNameText,
  };

  return (
    <>
      <DataFormErrorMapContext.Provider value={formContextState}>
        <div className="flex1 flex-column1 space-between1 min-height-38rem">
          <TaskHeader
            task={props.task}
            tooltipText={Config.passengerTransportCdlTabOne.disabledTooltipText}
          />
          {showAlert && (
            <Alert variant="error">
              <Content>{Config.passengerTransportCdlTabOne.pageLevelAlertText}</Content>
              {props.CMS_ONLY_show_error &&
                ["passengerTransportSchoolBus", "passengerTransportSixteenOrMorePassengers"].map(
                  (id) => (
                    <li key={`${id}`} id={`label-${id}`}>
                      <a href={`#question-${id}`}>
                        {fieldnameToConfig[id as keyof typeof fieldnameToConfig]}
                      </a>
                    </li>
                  ),
                )}
              {getInvalidFieldIds().map((id) => (
                <li key={`${id}`} id={`label-${id}`}>
                  <a href={`#question-${id}`}>
                    {fieldnameToConfig[id as keyof typeof fieldnameToConfig]}
                  </a>
                </li>
              ))}
            </Alert>
          )}
          {showResults ? (
            <PassengerTransportCdlResult
              setSchoolBusRadioValue={setSchoolBusRadioValue}
              setPassengersRadioValue={setPassengersRadioValue}
              CMS_ONLY_passengers_radio_value={props.CMS_ONLY_passengers_radio_value}
              CMS_ONLY_school_bus_radio_value={props.CMS_ONLY_school_bus_radio_value}
            />
          ) : (
            <PassengerTransportCdlQuestion
              taskId={props.task.id}
              onSubmit={onSubmit}
              formFuncWrapper={FormFuncWrapper}
              CMS_ONLY_show_error={props.CMS_ONLY_show_error}
              schoolBusRadioValue={schoolBusRadioValue}
              setSchoolBusRadioValue={setSchoolBusRadioValue}
              passengersRadioValue={passengersRadioValue}
              setPassengersRadioValue={setPassengersRadioValue}
            />
          )}
        </div>
      </DataFormErrorMapContext.Provider>
    </>
  );
};
