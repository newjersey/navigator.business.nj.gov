/* eslint-disable @typescript-eslint/no-explicit-any */
import { Documents } from "@/components/profile/Documents";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { ProfileTabs } from "@/lib/types/types";
import Profile from "@/pages/profile";
import { generateProfileData, generateUserData } from "@/test/factories";
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

const ProfilePreviewDocuments = (props: Props) => {
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
