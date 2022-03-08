import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const ContactPhoneNumber = (): ReactElement => {
  const visualFilter = (phoneNumber: string) => {
    const length = phoneNumber.length;
    if (length === 0) return phoneNumber;
    if (length < 4) return `(${phoneNumber}`;
    if (length < 7) return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  return (
    <div className="form-input margin-bottom-2">
      <BusinessFormationTextField
        validationText={Config.businessFormationDefaults.contactPhoneNumberErrorText}
        label={Config.businessFormationDefaults.contactPhoneNumberLabel}
        placeholder={Config.businessFormationDefaults.contactPhoneNumberPlaceholder}
        fieldName={"contactPhoneNumber"}
        numericProps={{
          maxLength: 10,
        }}
        visualFilter={visualFilter}
      />
    </div>
  );
};
