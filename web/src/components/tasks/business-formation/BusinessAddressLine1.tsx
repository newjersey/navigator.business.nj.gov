import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="businessAddressLine1"
        required={true}
        validationText={BusinessFormationDefaults.businessAddressLine1ErrorText}
      />
    </div>
  );
};
