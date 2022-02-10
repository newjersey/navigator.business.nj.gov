import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactFirstName"
      required={true}
      validationText={BusinessFormationDefaults.contactFirstnameErrorText}
    />
  );
};
