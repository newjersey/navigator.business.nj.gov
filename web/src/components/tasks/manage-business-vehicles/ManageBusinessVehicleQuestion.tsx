import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { WithErrorBar } from "@/components/WithErrorBar";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FormControl, FormControlLabel, Radio, RadioGroup } from "@mui/material";
import React from "react";

interface Props {
  taskId: string;
  onSubmit: (event?: React.FormEvent<HTMLFormElement>) => void;
  formFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?:
      | ((isValid: boolean, errors: unknown[], pageChange: boolean) => void | Promise<void>)
      | undefined,
  ) => void;
  CMS_ONLY_disable_error?: boolean;
}

export const ManageBusinessVehicleQuestion: React.FC<Props> = (props: Props) => {
  const { Config } = useConfig();
  const { business, updateQueue } = useUserData();
  const [radioValue, setRadioValue] = React.useState<boolean | undefined>(
    business?.roadmapTaskData?.manageBusinessVehicles,
  );

  const { setIsValid, isFormFieldInvalid, RegisterForOnSubmit } = useFormContextFieldHelpers(
    "manageBusinessVehicles",
    DataFormErrorMapContext,
    undefined,
  );

  const isValid = (): boolean => {
    return radioValue !== undefined;
  };

  RegisterForOnSubmit(() => isValid());

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const newValue = event.target.value === "true";
    setRadioValue(newValue);
    setIsValid(true);
  };
  props.formFuncWrapper(() => {
    updateQueue?.queueTaskProgress({ [props.taskId]: "COMPLETED" });
    updateQueue?.queueRoadmapTaskData({ manageBusinessVehicles: radioValue });
    updateQueue?.update();
  });

  const isError = props.CMS_ONLY_disable_error || isFormFieldInvalid;

  return (
    <div className="bg-accent-cooler-50 padding-205 radius-md">
      <form onSubmit={props.onSubmit}>
        <Heading level={2}>{Config.manageBusinessVehicles.h2HeaderText}</Heading>
        <div className="text-bold margin-top-3">
          {Config.manageBusinessVehicles.radioQuestionText}
        </div>
        <WithErrorBar hasError={isError} type="ALWAYS">
          <FormControl fullWidth>
            <RadioGroup
              name="manage-business-vehicles"
              value={radioValue === undefined ? "" : String(radioValue)}
              onChange={handleRadioChange}
              aria-label={Config.manageBusinessVehicles.radioQuestionText}
              row={true}
            >
              <FormControlLabel
                aria-label="aria-label-attribute"
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="true"
                control={<Radio color={isError ? "error" : "primary"} />}
                label={Config.manageBusinessVehicles.radioOptionOneText}
              />
              <FormControlLabel
                aria-label="aria-label-attribute"
                style={{ alignItems: "center" }}
                labelPlacement="end"
                value="false"
                control={<Radio color={isError ? "error" : "primary"} />}
                label={Config.manageBusinessVehicles.radioOptionTwoText}
              />
            </RadioGroup>
          </FormControl>
          {isError && (
            <div className="text-error-dark text-bold" data-testid="manage-business-vehicles-error">
              {Config.manageBusinessVehicles.inputErrorText}
            </div>
          )}
        </WithErrorBar>
        <Content>{Config.manageBusinessVehicles.learnMoreText}</Content>
        <div className="margin-top-3 flex flex-justify-end">
          <SecondaryButton isColor="accent-cooler" isSubmitButton>
            {Config.manageBusinessVehicles.saveButtonText}
          </SecondaryButton>
        </div>
      </form>
    </div>
  );
};
