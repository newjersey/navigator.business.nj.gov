import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { FocusEvent, ReactElement, useContext } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  const { state, setErrorMap } = useContext(FormationContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessAddressLine1: { invalid: true } });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, businessAddressLine1: { invalid: false } });
    }
  };

  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="businessAddressLine1"
        error={state.errorMap.businessAddressLine1.invalid}
        onValidation={onValidation}
        validationText={BusinessFormationDefaults.businessAddressLine1ErrorText}
      />
    </div>
  );
};
