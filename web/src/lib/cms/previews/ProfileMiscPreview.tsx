/* eslint-disable @typescript-eslint/no-explicit-any */
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ConfigContext, ConfigType, getMergedConfig } from "@/contexts/configContext";
import Profile from "@/pages/profile";
import { generateUser } from "@/test/factories";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
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

const ProfilePreviewMisc = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const [modalOpen, setModalOpen] = useState(false);
  const [config, setConfig] = useState<ConfigType>(getMergedConfig());

  const data = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const dataString = JSON.stringify(data);

  useEffect(() => {
    setConfig((prevConfig) => JSON.parse(JSON.stringify(merge(prevConfig, data))));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataString]);

  const emptyUserData = createEmptyUserData(generateUser({}));

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <h2>Escape Modal:</h2>
        <div ref={ref} style={{ pointerEvents: "all" }}>
          <button onClick={() => setModalOpen(true)}>Open Modal</button>
        </div>
        <EscapeModal
          isOpen={modalOpen}
          close={() => setModalOpen(false)}
          primaryButtonOnClick={() => setModalOpen(false)}
        />
        <hr className="margin-y-4" />

        <h2>Success Alert:</h2>
        <ProfileSnackbarAlert alert="SUCCESS" close={() => {}} />
        <hr className="margin-y-4" />

        <h2>Error Alert</h2>
        <ProfileSnackbarAlert alert="ERROR" close={() => {}} />
        <hr className="margin-y-4" />

        <h2 className="margin-bottom-4">Misc Buttons & Labels:</h2>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab="notes"
          CMS_ONLY_businessPersona="STARTING"
          CMS_ONLY_fakeUserData={emptyUserData}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewMisc;
