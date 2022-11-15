import { Content } from "@/components/Content";
import { Alert } from "@/components/njwds-extended/Alert";
import { OnboardingBusinessPersona } from "@/components/onboarding/OnboardingBusinessPersona";
import { OnboardingForeignBusinessType } from "@/components/onboarding/OnboardingForeignBusinessType";
import { OnboardingLegalStructure } from "@/components/onboarding/OnboardingLegalStructure";
import { OnboardingLocationInNewJersey } from "@/components/onboarding/OnboardingLocationInNewJersey";
import { ConfigContext } from "@/contexts/configContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { createEmptyProfileData } from "@businessnjgovnavigator/shared/profileData";

const ProfilePreviewOnboarding = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <ProfileDataContext.Provider
        value={{
          state: {
            profileData: createEmptyProfileData(),
            flow: businessPersona || "STARTING",
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
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessTypeIds.REMOTE_SELLER}</Content>
              </Alert>
              <Alert variant="info">
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessTypeIds.REMOTE_WORKER}</Content>
              </Alert>
              <Alert variant="info">
                <Content>{config.profileDefaults.FOREIGN.foreignBusinessTypeIds.NEXUS}</Content>
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
