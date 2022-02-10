import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactLastName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactLastName"
      required={true}
      validationText={BusinessFormationDefaults.contactLastnameErrorText}
    />
  );
};
