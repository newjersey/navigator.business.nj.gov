import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";
import { BusinessFormationTextField } from "./BusinessFormationTextField";

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
        validationText={Defaults.businessFormationDefaults.contactPhoneNumberErrorText}
        fieldName={"contactPhoneNumber"}
        numericProps={{
          maxLength: 10,
        }}
        visualFilter={visualFilter}
      />
    </div>
  );
};
