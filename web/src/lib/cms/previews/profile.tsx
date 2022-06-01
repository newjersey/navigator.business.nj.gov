/* eslint-disable @typescript-eslint/no-explicit-any */
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import { getMetadataFromSlug } from "@/lib/cms/previews/preview-helpers";
import { ProfileTabs } from "@/lib/types/types";
import Profile from "@/pages/profile";
import { generateUser } from "@/test/factories";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import merge from "lodash.merge";
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

const ProfilePreview = (props: Props) => {
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

  const { profileTab, businessPersona } = getMetadataFromSlug(props.entry.toJS().slug);
  const emptyUserData = createEmptyUserData(generateUser({}));

  const userData = {
    ...emptyUserData,
    profileData: {
      ...emptyUserData.profileData,
      legalStructureId: profileTab === "numbers" ? "limited-liability-company" : undefined,
      businessPersona,
    },
  };

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab={profileTab as ProfileTabs}
          CMS_ONLY_businessPersona={businessPersona}
          CMS_ONLY_fakeUserData={userData}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreview;
