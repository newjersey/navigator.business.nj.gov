import { FieldLabelProfile } from "@/components/onboarding/FieldLabelProfile";
import { IndustryDropdown } from "@/components/onboarding/IndustryDropdown";
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingCpa } from "@/components/onboarding/OnboardingCpa";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { isCannabisLicenseApplicable } from "@/lib/domain-logic/isCannabisLicenseApplicable";
import { isCertifiedInteriorDesignerApplicable } from "@/lib/domain-logic/isCertifiedInteriorDesignerApplicable";
import { isCpaRequiredApplicable } from "@/lib/domain-logic/isCpaRequiredApplicable";
import { isLiquorLicenseApplicable } from "@/lib/domain-logic/isLiquorLicenseApplicable";
import { isProvidesStaffingServicesApplicable } from "@/lib/domain-logic/isProvidesStaffingServicesApplicable";
import { isRealEstateAppraisalManagementApplicable } from "@/lib/domain-logic/isRealEstateAppraisalManagementApplicable";
import { ProfileFieldErrorMap, ProfileFields } from "@/lib/types/types";
import { FocusEvent, ReactElement, useContext } from "react";
import { OnboardingCertifiedInteriorDesigner } from "./OnboardingCertifiedInteriorDesigner";
import { OnboardingRealEstateAppraisalManagement } from "./OnboardingRealEstateAppraisalManagement";
import { OnboardingStaffingService } from "./OnboardingStaffingService";

interface Props {
  onValidation: (field: ProfileFields, invalid: boolean) => void;
  fieldStates: ProfileFieldErrorMap;
}

export const OnboardingIndustry = (props: Props): ReactElement => {
  const { state } = useContext(ProfileDataContext);
  const { Config } = useConfig();

  const onValidation = (event: FocusEvent<HTMLInputElement>): void => {
    const valid = event.target.value.length > 0;
    props.onValidation(fieldName, !valid);
  };

  const handleChange = (): void => props.onValidation(fieldName, false);

  const fieldName = "industryId";

  return (
    <div className="form-input margin-top-2">
      <IndustryDropdown
        error={props.fieldStates[fieldName].invalid}
        validationLabel="Error"
        validationText={Config.profileDefaults[state.flow].industryId.errorTextRequired}
        handleChange={handleChange}
        onValidation={onValidation}
      />

      {state.profileData.industryId === "home-contractor" && (
        <div className="margin-top-2" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <OnboardingHomeContractor />
        </div>
      )}

      {state.profileData.industryId === "employment-agency" && (
        <div className="margin-top-2" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <OnboardingEmploymentAgency />
        </div>
      )}

      {isCpaRequiredApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <FieldLabelProfile fieldName="requiresCpa" />
          <OnboardingCpa />
        </div>
      )}

      {isLiquorLicenseApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid="liquor-license">
          <FieldLabelProfile fieldName="liquorLicense" />
          <OnboardingLiquorLicense />
        </div>
      )}

      {isCannabisLicenseApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <FieldLabelProfile fieldName="cannabisLicenseType" />
          <OnboardingCannabisLicense />
        </div>
      )}

      {isCertifiedInteriorDesignerApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <FieldLabelProfile fieldName="certifiedInteriorDesigner" />
          <OnboardingCertifiedInteriorDesigner />
        </div>
      )}

      {isProvidesStaffingServicesApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <FieldLabelProfile fieldName="providesStaffingService" />
          <OnboardingStaffingService />
        </div>
      )}

      {isRealEstateAppraisalManagementApplicable(state.profileData.industryId) && (
        <div className="margin-top-4" data-testid={`industry-specific-${state.profileData.industryId}`}>
          <FieldLabelProfile fieldName="realEstateAppraisalManagement" />
          <OnboardingRealEstateAppraisalManagement />
        </div>
      )}
    </div>
  );
};
