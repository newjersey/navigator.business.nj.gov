import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const ContactLastName = (): ReactElement => {
  return (
    <BusinessFormationTextField
      fieldName="contactLastName"
      required={true}
      validationText={Defaults.businessFormationDefaults.contactLastnameErrorText}
    />
  );
};
