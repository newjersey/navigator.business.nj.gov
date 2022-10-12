import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingCertifiedInteriorDesigner } from "@/components/onboarding/OnboardingCertifiedInteriorDesigner";
import { OnboardingCpa } from "@/components/onboarding/OnboardingCpa";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { OnboardingLogisticsCompany } from "@/components/onboarding/OnboardingLogisticsCompany";
import { OnboardingMovingCompany } from "@/components/onboarding/OnboardingMovingCompany";
import { OnboardingRealEstateAppraisalManagement } from "@/components/onboarding/OnboardingRealEstateAppraisalManagement";
import { OnboardingStaffingService } from "@/components/onboarding/OnboardingStaffingService";
import { ConfigContext } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";

const ProfilePreviewIndustrySpecific = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <ProfileDataContext.Provider
          value={{
            state: {
              profileData: createEmptyProfileData(),
              flow: businessPersona || "STARTING",
              municipalities: [],
            },
            setUser: () => {},
            setProfileData: () => {},
            onBack: () => {},
          }}
        >
          <h1>Preview Fields</h1>
          <FieldLabelOnboarding fieldName="cannabisLicenseType" />
          <OnboardingCannabisLicense />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="certifiedInteriorDesigner" />
          <OnboardingCertifiedInteriorDesigner />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="requiresCpa" />
          <OnboardingCpa />
          <hr className="margin-y-4" />
          <OnboardingEmploymentAgency />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="homeBasedBusiness" />
          <OnboardingHomeBasedBusiness />
          <hr className="margin-y-4" />
          <OnboardingHomeContractor />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="liquorLicense" />
          <OnboardingLiquorLicense />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="realEstateAppraisalManagement" />
          <OnboardingRealEstateAppraisalManagement />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="providesStaffingService" />
          <OnboardingStaffingService />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="interstateMoving" />
          <OnboardingMovingCompany />
          <hr className="margin-y-4" />
          <FieldLabelOnboarding fieldName="interstateLogistics" />
          <OnboardingLogisticsCompany />
          <hr className="margin-y-440" />
        </ProfileDataContext.Provider>
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewIndustrySpecific;
