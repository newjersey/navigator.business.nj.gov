import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { FocusEvent, ReactElement, useState } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  const [error, setError] = useState(false);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setError(true);
    } else if (event.target.value.trim()) {
      setError(false);
    }
  };

  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="contactFirstName"
        error={error}
        onValidation={onValidation}
        validationText={BusinessFormationDefaults.contactFirstNameErrorText}
      />
    </div>
  );
};
