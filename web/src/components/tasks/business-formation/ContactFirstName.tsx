import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="contactFirstName"
        required={true}
        validationText={BusinessFormationDefaults.contactFirstnameErrorText}
      />
    </div>
  );
};
