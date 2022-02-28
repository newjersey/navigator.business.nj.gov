import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactLastName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactLastName"
      required={true}
      validationText={Config.businessFormationDefaults.contactLastnameErrorText}
    />
  );
};
