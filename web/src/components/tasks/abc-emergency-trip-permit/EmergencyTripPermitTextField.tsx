import { GenericTextField, GenericTextFieldProps } from "@/components/GenericTextField";
import { ModifiedContent } from "@/components/ModifiedContent";
import { WithErrorBar } from "@/components/WithErrorBar";
import { ReactElement } from "react";
import { EmergencyTripPermitTextField } from "../../../../../shared/src/emergencyTripPermit";

export interface Props extends Omit<GenericTextFieldProps, "value" | "fieldName" | "error" | "inputWidth"> {
  fieldName: EmergencyTripPermitTextField;
  label?: string;
  secondaryLabel?: string;
  readOnly?: boolean;
}

export const EmergencyTripPermitTextFieldEntry = ({ className, ...props }: Props): ReactElement => {
  const handleChange = (value: string): void => {
    props.handleChange && props.handleChange(value);
  };

  const hasError = false;
  return (
    <WithErrorBar className={className ?? "padding-bottom-1"} hasError={hasError} type={"ALWAYS"}>
      {props.label && (
        <strong>
          <ModifiedContent>{props.label}</ModifiedContent>
        </strong>
      )}
      {props.secondaryLabel && <span className="margin-left-1">{props.secondaryLabel}</span>}
      <GenericTextField
        inputWidth={"full"}
        {...props}
        readOnly={props.readOnly}
        handleChange={handleChange}
        error={hasError}
      />
    </WithErrorBar>
  );
};
