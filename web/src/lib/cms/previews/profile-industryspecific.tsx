/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldLabelOnboarding } from "@/components/onboarding/FieldLabelOnboarding";
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingCertifiedInteriorDesigner } from "@/components/onboarding/OnboardingCertifiedInteriorDesigner";
import { OnboardingCpa } from "@/components/onboarding/OnboardingCpa";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { OnboardingRealEstateAppraisalManagement } from "@/components/onboarding/OnboardingRealEstateAppraisalManagement";
import { OnboardingStaffingService } from "@/components/onboarding/OnboardingStaffingService";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { merge } from "lodash";
import { useEffect, useRef, useState } from "react";
import { getMetadataFromSlug } from "./preview-helpers";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  fieldsMetaData: any;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const ProfilePreviewIndustrySpecific = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);
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
        </ProfileDataContext.Provider>
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewIndustrySpecific;
