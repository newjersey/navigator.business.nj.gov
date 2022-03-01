import { Content } from "@/components/Content";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

export const BusinessAddressLine1 = (): ReactElement => {
  return (
    <div className="form-input margin-bottom-2">
      <Content>{Config.businessFormationDefaults.businessAddressHeader}</Content>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine1Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine1Placeholder}
        fieldName="businessAddressLine1"
        required={true}
        validationText={Config.businessFormationDefaults.businessAddressLine1ErrorText}
      />
    </div>
  );
};
