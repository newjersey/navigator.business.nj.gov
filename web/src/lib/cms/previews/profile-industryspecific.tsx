/* eslint-disable @typescript-eslint/no-explicit-any */
import { OnboardingCannabisLicense } from "@/components/onboarding/OnboardingCannabisLicense";
import { OnboardingCpa } from "@/components/onboarding/OnboardingCpa";
import { OnboardingEmploymentAgency } from "@/components/onboarding/OnboardingEmploymentAgency";
import { OnboardingHomeBasedBusiness } from "@/components/onboarding/OnboardingHomeBasedBusiness";
import { OnboardingHomeContractor } from "@/components/onboarding/OnboardingHomeContractor";
import { OnboardingLiquorLicense } from "@/components/onboarding/OnboardingLiquorLicense";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import merge from "lodash.merge";
import React, { useEffect, useRef, useState } from "react";

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
    setConfig(JSON.parse(JSON.stringify(merge(config, data))));
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
              flow: businessPersona === "OWNING" ? "OWNING" : "STARTING",
              municipalities: [],
            },
            setUser: () => {},
            setProfileData: () => {},
            onBack: () => {},
          }}
        >
          <OnboardingHomeBasedBusiness headerAriaLevel={2} h3Heading={true} />
          {businessPersona === "STARTING" && (
            <>
              <hr className="margin-y-4" />
              <OnboardingCannabisLicense />
              <hr className="margin-y-4" />
              <OnboardingCpa />
              <hr className="margin-y-4" />
              <OnboardingEmploymentAgency />
              <hr className="margin-y-4" />
              <OnboardingHomeContractor />
              <hr className="margin-y-4" />
              <OnboardingLiquorLicense />
            </>
          )}
        </ProfileDataContext.Provider>
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewIndustrySpecific;
