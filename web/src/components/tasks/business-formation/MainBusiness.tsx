import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { templateEval, zipCodeRange } from "@/lib/utils/helpers";
import React, { ReactElement } from "react";
import { BusinessAddressLine1 } from "./BusinessAddressLine1";
import { BusinessFormationTextField } from "./BusinessFormationTextField";
import { BusinessNameAndLegalStructure } from "./BusinessNameAndLegalStructure";
import { BusinessStartDate } from "./BusinessStartDate";
import { BusinessSuffixDropdown } from "./BusinessSuffixDropdown";

export const MainBusiness = (): ReactElement => {
  const { userData } = useUserData();

  const makeUpdateProfileLink = (label: string, value: string): ReactElement => {
    const linkElement = <a href="/profile">{BusinessFormationDefaults.updateYourProfileLinkText}</a>;
    const splitText = templateEval(BusinessFormationDefaults.updateYourProfileDisplayText, {
      value,
      link: "${link}",
    }).split("${link}");
    return (
      <div className="margin-bottom-2">
        <span className="text-bold">{label}&nbsp;</span>
        <span>
          {splitText[0]}
          {linkElement}
          {splitText[1]}
        </span>
      </div>
    );
  };

  return (
    <>
      <BusinessNameAndLegalStructure />
      <BusinessSuffixDropdown />
      <BusinessStartDate />
      <BusinessAddressLine1 />
      <BusinessFormationTextField fieldName="businessAddressLine2" />
      {makeUpdateProfileLink(
        BusinessFormationDefaults.businessAddressCityLabel,
        userData?.profileData.municipality?.name || BusinessFormationDefaults.notSetBusinessAddressCityLabel
      )}
      <BusinessFormationTextField fieldName="businessAddressState" disabled={true} />
      <div className="form-input margin-bottom-2">
        <BusinessFormationTextField
          numericProps={{
            maxLength: 5,
          }}
          required={true}
          fieldName={"businessAddressZipCode"}
          validationText={BusinessFormationDefaults.businessaddressZipCodeErrorText}
          additionalValidation={zipCodeRange}
        />
      </div>
    </>
  );
};
