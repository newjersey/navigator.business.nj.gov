import { Content } from "@/components/Content";
import { BusinessFormationDefaults } from "@/display-defaults/roadmap/business-formation/BusinessFormationDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { setHeaderRole, templateEval, zipCodeRange } from "@/lib/utils/helpers";
import { LookupLegalStructureById } from "@businessnjgovnavigator/shared";
import React, { ReactElement, useContext } from "react";
import { FormationContext } from "../BusinessFormation";
import { BusinessAddressLine1 } from "./BusinessAddressLine1";
import { BusinessFormationNumericField } from "./BusinessFormationNumericField";
import { BusinessFormationTextField } from "./BusinessFormationTextField";
import { BusinessStartDate } from "./BusinessStartDate";
import { BusinessSuffixDropdown } from "./BusinessSuffixDropdown";

export const MainBusiness = (): ReactElement => {
  const { state } = useContext(FormationContext);

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

  const headerLevelTwo = setHeaderRole(2, "h3-styling");

  return (
    <>
      <div className="margin-bottom-2">
        <Content overrides={{ h3: headerLevelTwo }}>
          {state.displayContent.businessNameAndLegalStructure.contentMd}
        </Content>
      </div>
      {makeUpdateProfileLink(
        BusinessFormationDefaults.legalStructureLabel,
        LookupLegalStructureById(userData?.profileData.legalStructureId).name
      )}
      {makeUpdateProfileLink(
        BusinessFormationDefaults.businessNameLabel,
        userData?.profileData.businessName || BusinessFormationDefaults.notSetBusinessNameText
      )}
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
        <BusinessFormationNumericField
          minLength={5}
          maxLength={5}
          fieldName={"businessAddressZipCode"}
          validationText={BusinessFormationDefaults.businessaddressZipCodeErrorText}
          additionalValidation={zipCodeRange}
        />
      </div>
    </>
  );
};
