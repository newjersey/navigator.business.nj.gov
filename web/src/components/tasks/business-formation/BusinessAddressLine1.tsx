import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="businessAddressLine1"
        required={true}
        validationText={Defaults.businessFormationDefaults.businessAddressLine1ErrorText}
      />
    </div>
  );
};
