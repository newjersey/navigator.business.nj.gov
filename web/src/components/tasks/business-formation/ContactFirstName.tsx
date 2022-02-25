import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactFirstName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactFirstName"
      required={true}
      validationText={Defaults.businessFormationDefaults.contactFirstnameErrorText}
    />
  );
};
