import { ModifiedContent } from "@/components/ModifiedContent";
import { StateDropdown } from "@/components/StateDropdown";
import { WithErrorBar } from "@/components/WithErrorBar";
import { EmergencyTripPermitContext } from "@/contexts/EmergencyTripPermitContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useEmergencyTripPermitErrors } from "@/lib/data-hooks/useEmergencyTripPermitErrors";
import { EmergencyTripPermitFieldNames } from "@businessnjgovnavigator/shared/emergencyTripPermit";
import { ReactElement, useContext } from "react";

interface Props {
  fieldName: EmergencyTripPermitFieldNames;
}

export const EmergencyTripPermitStateDropdown = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const context = useContext(EmergencyTripPermitContext);
  const fieldNameLabels = Config.abcEmergencyTripPermit.fields as Record<
    EmergencyTripPermitFieldNames,
    string
  >;
  const hasError = context.state.applicationInfo[props.fieldName] === "";
  const { getFieldErrorLabel } = useEmergencyTripPermitErrors();
  return (
    <div className={"padding-top-1"}>
      <WithErrorBar className={"padding-bottom-1"} hasError={hasError} type={"ALWAYS"}>
        <strong>
          <ModifiedContent>{fieldNameLabels[props.fieldName]}</ModifiedContent>
        </strong>
        <StateDropdown
          fieldName={"requestorState"}
          onSelect={(state) => {
            if (state && state.shortCode !== "Outside of the USA") {
              context.setApplicationInfo({
                ...context.state.applicationInfo,
                [props.fieldName]: state?.shortCode,
              });
            }
          }}
          value={context.state.applicationInfo[props.fieldName]}
          error={hasError}
          validationText={getFieldErrorLabel(props.fieldName)}
        />
      </WithErrorBar>
    </div>
  );
};
