import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const ContactLastName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      label={Config.businessFormationDefaults.contactLastNameLabel}
      placeholder={Config.businessFormationDefaults.contactLastNamePlaceholder}
      fieldName="contactLastName"
      required={true}
      validationText={Config.businessFormationDefaults.contactLastnameErrorText}
    />
  );
};
