import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactFirstName"
      required={true}
      validationText={Config.businessFormationDefaults.contactFirstnameErrorText}
    />
  );
};
