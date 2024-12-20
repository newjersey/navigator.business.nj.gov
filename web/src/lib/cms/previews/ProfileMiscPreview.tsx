import { Alert } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { ProfileEscapeModal } from "@/components/profile/ProfileEscapeModal";
import { ProfileSnackbarAlert } from "@/components/profile/ProfileSnackbarAlert";
import { ConfigContext } from "@/contexts/configContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import Profile from "@/pages/profile";
import { createEmptyProfileData, generateBusiness, generateUserData } from "@businessnjgovnavigator/shared";
import { ReactElement, useState } from "react";

const ProfilePreviewMisc = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(false);

  const userData = generateUserData({});
  const business = generateBusiness(userData, {
    profileData: {
      ...createEmptyProfileData(),
      legalStructureId: "limited-liability-company",
    },
  });

  return (
    <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
      <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
        <Heading level={2}>Escape Modal:</Heading>
        <div ref={ref} style={{ pointerEvents: "all" }}>
          <button onClick={(): void => setModalOpen(true)}>Open Modal</button>
        </div>
        <ProfileEscapeModal
          isOpen={modalOpen}
          close={(): void => setModalOpen(false)}
          primaryButtonOnClick={(): void => setModalOpen(false)}
        />
        <hr className="margin-y-4" />

        <Heading level={2}>Success Alert:</Heading>
        <ProfileSnackbarAlert alert="SUCCESS" close={(): void => {}} />
        <hr className="margin-y-4" />

        <Heading level={2}>Error Alert</Heading>
        <ProfileSnackbarAlert alert="ERROR" close={(): void => {}} />
        <hr className="margin-y-4" />

        <Heading level={2}>Essential Question Alert Banner</Heading>
        <Alert variant="error">{config.profileDefaults.default.essentialQuestionAlertText}</Alert>

        <hr className="margin-y-4" />
        <Heading level={2}>Essential Question Inline Error Text</Heading>
        {config.siteWideErrorMessages.errorRadioButton}
        <hr className="margin-y-4" />

        <Heading level={2} className="margin-bottom-4">
          Misc Buttons & Labels:
        </Heading>
        <Profile
          municipalities={[]}
          CMS_ONLY_tab="documents"
          CMS_ONLY_businessPersona="STARTING"
          CMS_ONLY_fakeBusiness={business}
        />
        <hr className="margin-y-4" />

        <Heading level={2}>Cannabis Location Alert: </Heading>
        <Alert variant="warning">{config.profileDefaults.default.cannabisLocationAlert}</Alert>
      </div>
    </ConfigContext.Provider>
  );
};

export default ProfilePreviewMisc;
