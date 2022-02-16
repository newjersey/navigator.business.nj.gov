import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { zipCodeRange } from "@/lib/utils/helpers";
import React, { ReactElement } from "react";
import { BusinessAddressLine1 } from "./BusinessAddressLine1";
import { BusinessFormationTextField } from "./BusinessFormationTextField";
import { BusinessNameAndLegalStructure } from "./BusinessNameAndLegalStructure";
import { BusinessStartDate } from "./BusinessStartDate";
import { BusinessSuffixDropdown } from "./BusinessSuffixDropdown";

export const MainBusiness = (): ReactElement => {
  const { userData } = useUserData();

  return (
    <>
      <BusinessNameAndLegalStructure />
      <div className="grid-row grid-gap-2">
        <div className="tablet:grid-col-6">
          <BusinessSuffixDropdown />
        </div>
        <div className="tablet:grid-col-6 margin-bottom-2">
          <BusinessStartDate />
        </div>
      </div>
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <BusinessAddressLine1 />
      <BusinessFormationTextField fieldName="businessAddressLine2" />
      <div className="grid-row grid-gap-2">
        <div className="margin-bottom-2 grid-col-12 tablet:grid-col-6">
          <span className="text-bold">{BusinessFormationDefaults.businessAddressCityLabel}</span>
          <div>
            {userData?.profileData.municipality?.name ??
              BusinessFormationDefaults.notSetBusinessAddressCityLabel}{" "}
            <a href="/profile">{BusinessFormationDefaults.editButtonText}</a>
          </div>
        </div>
        <div className="margin-bottom-2 form-input grid-col-5 tablet:grid-col-2">
          <BusinessFormationTextField fieldName="businessAddressState" disabled={true} />
        </div>
        <div className="margin-bottom-2 form-input grid-col-7 tablet:grid-col-4">
          <BusinessFormationTextField
            numericProps={{
              maxLength: 5,
            }}
            required={true}
            fieldName={"businessAddressZipCode"}
            validationText={BusinessFormationDefaults.businessAddressZipCodeErrorText}
            additionalValidation={zipCodeRange}
          />
        </div>
      </div>
    </>
  );
};
