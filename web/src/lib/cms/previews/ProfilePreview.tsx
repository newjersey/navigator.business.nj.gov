import { ConfigContext } from "@/contexts/configContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ProfileTabs } from "@/lib/types/types";
import Profile from "@/pages/profile";
import { generateUser } from "@/test/factories";
import { OperatingPhaseId } from "@businessnjgovnavigator/shared/operatingPhase";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";

const ProfilePreview = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { tab, businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);
  const emptyUserData = createEmptyUserData(generateUser({}));

  const userData = {
    ...emptyUserData,
    profileData: {
      ...emptyUserData.profileData,
      businessName: "cmsPreview",
      nexusDbaName: "cmsPreview",
      legalStructureId:
        tab === "numbers" || businessPersona === "FOREIGN" ? "limited-liability-company" : undefined,
      businessPersona,
      operatingPhase: "FORMED_AND_REGISTERED" as OperatingPhaseId,
    },
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab={tab as ProfileTabs}
          CMS_ONLY_businessPersona={businessPersona}
          CMS_ONLY_foreignBusinessType={businessPersona === "FOREIGN" ? "NEXUS" : "NONE"}
          CMS_ONLY_fakeUserData={userData}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreview;
