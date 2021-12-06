import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { FocusEvent, ReactElement, useState } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  const [error, setError] = useState(false);

  const onValidation = (event: FocusEvent<HTMLInputElement>) => {
    if (!event.target.value.trim()) {
      setError(true);
    } else if (event.target.value.trim()) {
      setError(false);
    }
  };

  return (
    <BusinessFormationTextField
      fieldName="businessAddressLine1"
      error={error}
      onValidation={onValidation}
      validationText={BusinessFormationDefaults.businessAddressLine1ErrorText}
    />
  );
};
