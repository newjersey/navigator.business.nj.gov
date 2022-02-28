import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        fieldName="businessAddressLine1"
        required={true}
        validationText={Config.businessFormationDefaults.businessAddressLine1ErrorText}
      />
    </div>
  );
};
