import { Content } from "@/components/Content";
import { BusinessNameAndLegalStructure } from "@/components/tasks/business-formation/business/BusinessNameAndLegalStructure";
import { FormationMunicipality } from "@/components/tasks/business-formation/business/FormationMunicipality";
import { FormationStartDate } from "@/components/tasks/business-formation/business/FormationStartDate";
import { SuffixDropdown } from "@/components/tasks/business-formation/business/SuffixDropdown";
import { BusinessFormationTextField } from "@/components/tasks/business-formation/BusinessFormationTextField";
import { zipCodeRange } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const MainBusiness = (): ReactElement => {
  return (
    <>
      <BusinessNameAndLegalStructure />
      <div className="grid-row grid-gap-2">
        <div className="tablet:grid-col-6">
          <SuffixDropdown />
        </div>
        <div className="tablet:grid-col-6 margin-bottom-2">
          <FormationStartDate />
        </div>
      </div>
      <hr className="margin-bottom-2 margin-top-0" aria-hidden={true} />
      <div className="margin-bottom-2">
        <Content>{Config.businessFormationDefaults.businessAddressHeader}</Content>
      </div>
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine1Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine1Placeholder}
        fieldName="businessAddressLine1"
        required={true}
        validationText={Config.businessFormationDefaults.businessAddressLine1ErrorText}
      />
      <BusinessFormationTextField
        label={Config.businessFormationDefaults.businessAddressAddressLine2Label}
        placeholder={Config.businessFormationDefaults.businessAddressAddressLine2Placeholder}
        fieldName="businessAddressLine2"
      />
      <div className="grid-row grid-gap-2 margin-top-2">
        <div className="margin-bottom-2 grid-col-12 tablet:grid-col-6">
          <span className="text-bold margin-bottom-2">
            {Config.businessFormationDefaults.businessAddressCityLabel}
          </span>
          <FormationMunicipality />
        </div>
        <div className="margin-bottom-2 form-input grid-col-5 tablet:grid-col-2">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.businessAddressStateLabel}
            placeholder={Config.businessFormationDefaults.businessAddressStatePlaceholder}
            fieldName="businessAddressState"
            disabled={true}
          />
        </div>
        <div className="margin-bottom-2 form-input grid-col-7 tablet:grid-col-4">
          <BusinessFormationTextField
            label={Config.businessFormationDefaults.businessAddressZipCodeLabel}
            placeholder={Config.businessFormationDefaults.businessAddressZipCodePlaceholder}
            numericProps={{
              maxLength: 5,
            }}
            required={true}
            fieldName={"businessAddressZipCode"}
            validationText={Config.businessFormationDefaults.businessAddressZipCodeErrorText}
            additionalValidation={zipCodeRange}
          />
        </div>
      </div>
    </>
  );
};
