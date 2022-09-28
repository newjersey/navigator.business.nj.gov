import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import Profile from "@/pages/profile";
import { generateUser } from "@/test/factories";
import { createEmptyUserData } from "@businessnjgovnavigator/shared/userData";
import { useState } from "react";

const ProfilePreviewMisc = (props: PreviewProps) => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

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
