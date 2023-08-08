import { Alert } from "@/components/njwds-extended/Alert";
import { EscapeModal } from "@/components/profile/EscapeModal";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import Profile from "@/pages/profile";
import { createEmptyProfileData, generateBusiness } from "@businessnjgovnavigator/shared";
import { ReactElement, useState } from "react";

const ProfilePreviewMisc = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  const business = generateBusiness({
    profileData: {
      ...createEmptyProfileData(),
      legalStructureId: "limited-liability-company",
    },
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <h2>Escape Modal:</h2>
        <div ref={ref} style={{ pointerEvents: "all" }}>
          <button onClick={(): void => setModalOpen(true)}>Open Modal</button>
        </div>
        <EscapeModal
          isOpen={modalOpen}
          close={(): void => setModalOpen(false)}
          primaryButtonOnClick={(): void => setModalOpen(false)}
        />
        <hr className="margin-y-4" />

        <h2>Success Alert:</h2>
        <ProfileSnackbarAlert alert="SUCCESS" close={(): void => {}} />
        <hr className="margin-y-4" />

        <h2>Error Alert</h2>
        <ProfileSnackbarAlert alert="ERROR" close={(): void => {}} />
        <hr className="margin-y-4" />

        <h2>Essential Question Alert Banner</h2>
        <Alert variant="error">{config.profileDefaults.default.essentialQuestionAlertText}</Alert>

        <hr className="margin-y-4" />
        <h2>Essential Question Inline Error Text</h2>
        {config.profileDefaults.default.essentialQuestionInlineText}
        <hr className="margin-y-4" />

        <h2 className="margin-bottom-4">Misc Buttons & Labels:</h2>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab="documents"
          CMS_ONLY_businessPersona="STARTING"
          CMS_ONLY_fakeBusiness={business}
        />
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewMisc;
