import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { FocusEvent, ReactElement, useContext } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  const { state, setErrorMap } = useContext(FormationContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, contactFirstName: { invalid: true } });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, contactFirstName: { invalid: false } });
    }
  };

  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="contactFirstName"
        error={state.errorMap.contactFirstName.invalid}
        onValidation={onValidation}
        validationText={BusinessFormationDefaults.contactFirstNameErrorText}
      />
    </div>
  );
};
