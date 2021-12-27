import { FormationContext } from "@/components/tasks/BusinessFormation";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { FocusEvent, ReactElement, useContext } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactLastName = (): ReactElement => {
  const { state, setErrorMap } = useContext(FormationContext);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, contactLastName: { invalid: true } });
    } else if (event.target.value.trim()) {
      setErrorMap({ ...state.errorMap, contactLastName: { invalid: false } });
    }
  };

  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="contactLastName"
        error={state.errorMap.contactLastName.invalid}
        onValidation={onValidation}
        validationText={BusinessFormationDefaults.contactLastNameErrorText}
      />
    </div>
  );
};
