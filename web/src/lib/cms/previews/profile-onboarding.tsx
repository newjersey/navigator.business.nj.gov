/* eslint-disable @typescript-eslint/no-explicit-any */
import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";
import { merge } from "lodash";
import { useEffect, useRef, useState } from "react";

type Props = {
  entry?: any;
  window: Window;
  document: Document;
  fieldsMetaData: any;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const ProfilePreviewOnboarding = (props: Props) => {
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
        <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
          {businessPersona === "STARTING" && (
            <>
              <OnboardingBusinessPersona />
              <hr className="margin-y-4" />
              <OnboardingLegalStructure />
            </>
          )}
          {businessPersona === "FOREIGN" && (
            <>
              <OnboardingForeignBusinessType />
              <Alert variant="info">
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_SELLER}</Content>
              </Alert>
              <Alert variant="info">
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessType.REMOTE_WORKER}</Content>
              </Alert>
              <Alert variant="info">
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessType.NEXUS}</Content>
              </Alert>

              <hr className="margin-y-4" />
              <OnboardingLocationInNewJersey />
            </>
          )}
        </div>
      </ProfileDataContext.Provider>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewOnboarding;
