import React, { ReactElement } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Heading } from "@/components/njwds-extended/Heading";
import { WithErrorBar } from "@/components/WithErrorBar";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ScrollableFormFieldWrapper } from "@/components/data-fields/ScrollableFormFieldWrapper";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { scrollToTop } from "@/lib/utils/helpers";

interface Props {
  taskId: string;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  formFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?:
      | ((isValid: boolean, errors: unknown[], pageChange: boolean) => void | Promise<void>)
      | undefined,
  ) => void;
  CMS_ONLY_show_error?: boolean;
  schoolBusRadioValue?: boolean;
  passengersRadioValue?: boolean;
  setSchoolBusRadioValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  setPassengersRadioValue: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

export const PassengerTransportCdlQuestion = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { updateQueue } = useUserData();

  const {
    setIsValid: setSchoolBusRadioIsValid,
    isFormFieldInvalid: isSchoolBusFormFieldValid,
    RegisterForOnSubmit: RegisterSchoolBusForOnSubmit,
  } = useFormContextFieldHelpers("passengerTransportSchoolBus", DataFormErrorMapContext, undefined);

  const {
    setIsValid: setPassengerRadioIsValid,
    isFormFieldInvalid: isPassengerFormFieldValid,
    RegisterForOnSubmit: RegisterPassengerForOnSubmit,
  } = useFormContextFieldHelpers(
    "passengerTransportSixteenOrMorePassengers",
    DataFormErrorMapContext,
    undefined,
  );

  const isSchoolBusRadioValue1Valid = (): boolean => {
    return props.schoolBusRadioValue !== undefined;
  };

  const isPassengerRadioValue2Valid = (): boolean => {
    return props.passengersRadioValue !== undefined;
  };

  RegisterSchoolBusForOnSubmit(() => isSchoolBusRadioValue1Valid());
  RegisterPassengerForOnSubmit(() => isPassengerRadioValue2Valid());

  const handleSchoolBusRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value === "true";
    props.setSchoolBusRadioValue(newValue);
    setSchoolBusRadioIsValid(true);
  };

  const handlePassengerRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value === "true";
    props.setPassengersRadioValue(newValue);
    setPassengerRadioIsValid(true);
  };

  props.formFuncWrapper(() => {
    updateQueue?.queueTaskProgress({ [props.taskId]: "COMPLETED" });
    updateQueue?.queueRoadmapTaskData({ passengerTransportSchoolBus: props.schoolBusRadioValue });
    updateQueue?.queueRoadmapTaskData({
      passengerTransportSixteenOrMorePassengers: props.passengersRadioValue,
    });
    updateQueue?.update();
  });

  const isSchoolBusError = props.CMS_ONLY_show_error || isSchoolBusFormFieldValid;
  const isPassengerError = props.CMS_ONLY_show_error || isPassengerFormFieldValid;

  return (
    <div className="bg-accent-cooler-50 padding-205 radius-md">
      <form onSubmit={props.onSubmit}>
        <Heading level={2}>{Config.passengerTransportCdlTabOne.headerText}</Heading>

        <ScrollableFormFieldWrapper fieldName={"passengerTransportSchoolBus"}>
          <div className="text-bold margin-top-3">
            {Config.passengerTransportCdlTabOne.firstQuestionLabel}
          </div>
          <WithErrorBar hasError={isSchoolBusError} type="ALWAYS">
            <FormControl fullWidth>
              <RadioGroup
                name="passenger-transport-school-bus"
                value={
                  props.schoolBusRadioValue === undefined ? "" : String(props.schoolBusRadioValue)
                }
                onChange={handleSchoolBusRadioChange}
                aria-label={Config.passengerTransportCdlTabOne.firstQuestionLabel}
              >
                <FormControlLabel
                  aria-label={Config.passengerTransportCdlTabOne.firstQuestionTrueText}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  value="true"
                  control={<Radio color={isSchoolBusError ? "error" : "primary"} />}
                  label={Config.passengerTransportCdlTabOne.firstQuestionTrueText}
                />
                <FormControlLabel
                  aria-label={Config.passengerTransportCdlTabOne.firstQuestionFalseText}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  value="false"
                  control={<Radio color={isSchoolBusError ? "error" : "primary"} />}
                  label={Config.passengerTransportCdlTabOne.firstQuestionFalseText}
                />
              </RadioGroup>
            </FormControl>
            {isSchoolBusError && (
              <div
                className="text-error-dark text-bold"
                data-testid="passenger-transport-school-bus-error"
              >
                {Config.passengerTransportCdlTabOne.firstQuestionInputErrorText}
              </div>
            )}
          </WithErrorBar>
        </ScrollableFormFieldWrapper>

        <ScrollableFormFieldWrapper fieldName={"passengerTransportSixteenOrMorePassengers"}>
          <div className="text-bold margin-top-3">
            {Config.passengerTransportCdlTabOne.secondQuestionLabel}
          </div>
          <WithErrorBar hasError={isPassengerError} type="ALWAYS">
            <FormControl fullWidth>
              <RadioGroup
                name="passenger-transport-sixteen-or-more-passengers"
                value={
                  props.passengersRadioValue === undefined ? "" : String(props.passengersRadioValue)
                }
                onChange={handlePassengerRadioChange}
                aria-label={Config.passengerTransportCdlTabOne.secondQuestionLabel}
              >
                <FormControlLabel
                  aria-label={Config.passengerTransportCdlTabOne.secondQuestionTrueText}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  value="true"
                  control={<Radio color={isPassengerError ? "error" : "primary"} />}
                  label={Config.passengerTransportCdlTabOne.secondQuestionTrueText}
                />
                <FormControlLabel
                  aria-label={Config.passengerTransportCdlTabOne.secondQuestionFalseText}
                  style={{ alignItems: "center" }}
                  labelPlacement="end"
                  value="false"
                  control={<Radio color={isPassengerError ? "error" : "primary"} />}
                  label={Config.passengerTransportCdlTabOne.secondQuestionFalseText}
                />
              </RadioGroup>
            </FormControl>
            {isPassengerError && (
              <div
                className="text-error-dark text-bold"
                data-testid="passenger-transport-sixteen-or-more-passengers-error"
              >
                {Config.passengerTransportCdlTabOne.secondQuestionInputErrorText}
              </div>
            )}
          </WithErrorBar>
        </ScrollableFormFieldWrapper>
        <div className="margin-top-3">
          <Content>{Config.passengerTransportCdlTabOne.bodyText}</Content>
        </div>
        <div className="margin-top-3 flex flex-justify-end">
          <PrimaryButton isColor="accent-cooler" isSubmitButton onClick={scrollToTop}>
            {Config.passengerTransportCdlTabOne.saveButton}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
};
