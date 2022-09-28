import { Documents } from "@/components/profile/Documents";
import { ConfigContext } from "@/contexts/configContext";
import { getMetadataFromSlug, PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { ProfileTabs } from "@/lib/types/types";
import Profile from "@/pages/profile";
import { generateProfileData, generateUserData } from "@/test/factories";

const ProfilePreviewDocuments = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const { tab, businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);

  const llcUserDataNoDocs = generateUserData({
    profileData: generateProfileData({
      legalStructureId: "limited-liability-company",
    }),
  });

  const llcUserDataWithDocs = generateUserData({
    profileData: generateProfileData({
      legalStructureId: "limited-liability-company",
      documents: {
        formationDoc: "asdf",
        standingDoc: "asdf",
        certifiedDoc: "asdf",
      },
    }),
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <h2>Formation completed state:</h2>
        <Documents CMS_ONLY_fakeUserData={llcUserDataWithDocs} />
        <hr className="margin-y-4" />
        <h2 className="margin-bottom-4">Formation not completed (or non-LLC) state:</h2>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab={tab as ProfileTabs}
          CMS_ONLY_businessPersona={businessPersona}
          CMS_ONLY_fakeUserData={llcUserDataNoDocs}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewDocuments;
