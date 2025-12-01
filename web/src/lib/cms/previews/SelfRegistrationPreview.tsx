import { NeedsAccountModal } from "@/components/auth/NeedsAccountModal";
import { RegistrationStatusSnackbar } from "@/components/auth/RegistrationStatusSnackbar";
import { AccountSetupForm } from "@/components/data-fields/AccountSetupForm";
import {
  createDataFormErrorMap,
  DataFormErrorMapContext,
} from "@/contexts/dataFormErrorMapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePreviewConfig } from "@/lib/cms/helpers/usePreviewConfig";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { useFormContextHelper } from "@/lib/data-hooks/useFormContextHelper";
import {
  BusinessUser,
  RegistrationStatus,
  registrationStatusList,
} from "@businessnjgovnavigator/shared/businessUser";
import { ConfigContext } from "@businessnjgovnavigator/shared/contexts";
import { OnboardingErrors } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useState } from "react";

const SelfRegistrationPreview = (props: PreviewProps): ReactElement => {
  const { config, setConfig } = usePreviewConfig(props);
  const ref = usePreviewRef(props);

  const [modalOpen, setModalOpen] = useState(true);
  const [changeRegistrationStatus, setChangeRegistrationStatus] = useState(0);

  const nextRegistrationStatus = (): void => {
    if (changeRegistrationStatus + 1 >= registrationStatusList.length) {
      setChangeRegistrationStatus(0);
    } else {
      setChangeRegistrationStatus((prev) => prev + 1);
    }
  };

  const currentRegistrationStatus = registrationStatusList[changeRegistrationStatus];

  const { FormFuncWrapper, state: formContextState } =
    useFormContextHelper(createDataFormErrorMap<OnboardingErrors>());

  FormFuncWrapper(
    async (): Promise<void> => {},
    () => {},
  );

  return (
    <NeedsAccountContext.Provider
      value={{
        isAuthenticated: modalOpen ? IsAuthenticated.TRUE : IsAuthenticated.FALSE,
        showNeedsAccountSnackbar: true,
        showNeedsAccountModal: true,
        registrationStatus: currentRegistrationStatus as RegistrationStatus,
        setRegistrationStatus: () => {},
        setShowNeedsAccountSnackbar: () => {
          setModalOpen(true);
        },
        setShowNeedsAccountModal: () => {
          setModalOpen(true);
        },
        showContinueWithoutSaving: true,
        setShowContinueWithoutSaving: () => {},
        userWantsToContinueWithoutSaving: true,
        setUserWantsToContinueWithoutSaving: () => {},
      }}
    >
      <ConfigContext.Provider value={{ config, setOverrides: setConfig }}>
        <DataFormErrorMapContext.Provider value={formContextState}>
          <div className="cms disable-position-for-cms" ref={ref} style={{ margin: 40 }}>
            <button onClick={() => setModalOpen(false)}>open needs account modal</button>
            <button onClick={() => nextRegistrationStatus()}>
              change registration status, currently: {currentRegistrationStatus}
            </button>
            <NeedsAccountModal />
            <RegistrationStatusSnackbar />
            <AccountSetupForm
              user={{
                name: "name",
                email: "email@email.com",
                id: "123123123",
                externalStatus: {
                  newsletter: undefined,
                  userTesting: undefined,
                },
                receiveNewsletter: false,
                userTesting: false,
                receiveUpdatesAndReminders: true,
                accountCreationSource: "",
                contactSharingWithAccountCreationPartner: false,
                myNJUserKey: undefined,
                intercomHash: undefined,
                abExperience: "ExperienceA",
                phoneNumber: undefined,
              }}
              setUser={function (user: BusinessUser): void {
                console.error(user);
              }}
            />
          </div>
        </DataFormErrorMapContext.Provider>
      </ConfigContext.Provider>
    </NeedsAccountContext.Provider>
  );
};

export default SelfRegistrationPreview;
