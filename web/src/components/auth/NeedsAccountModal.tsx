import { Content } from "@/components/Content";
import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext } from "react";

export const NeedsAccountModal = (): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const {
    isAuthenticated,
    showNeedsAccountModal,
    showContinueWithoutSaving,
    setShowNeedsAccountModal,
    setUserWantsToContinueWithoutSaving,
  } = useContext(NeedsAccountContext);
  const { Config } = useConfig();
  const loginPageEnabled = process.env.FEATURE_LOGIN_PAGE === "true";

  useMountEffectWhenDefined(() => {
    if (isAuthenticated === IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(false);
    }
  }, isAuthenticated);

  if (isAuthenticated === IsAuthenticated.TRUE) {
    return <></>;
  }

  const linkToAccountSetup = (): void => {
    if (business?.preferences.returnToLink === `${ROUTES.dashboard}`) {
      analytics.event.myNJ_prompt_modal_complete_button.click.go_to_NavigatorAccount_setup();
    } else {
      analytics.event.guest_modal.click.go_to_NavigatorAccount_setup();
    }
    setShowNeedsAccountModal(false);
    router && router.push(ROUTES.accountSetup);
  };

  return (
    <>
      <ModalZeroButton
        isOpen={showNeedsAccountModal}
        close={(): void => setShowNeedsAccountModal(false)}
        title={Config.selfRegistration.needsAccountModalTitle}
      >
        <div data-testid="self-reg-modal">
          <Content>{Config.selfRegistration.needsAccountModalBody}</Content>
          <div className="margin-top-3">
            <PrimaryButton isColor="primary" isFullWidthOnDesktop onClick={linkToAccountSetup}>
              {Config.selfRegistration.needsAccountModalButtonText}
            </PrimaryButton>
            {showContinueWithoutSaving && (
              <SecondaryButton
                isColor="primary"
                className={"margin-top-05"}
                isFullWidthOnDesktop
                onClick={() => {
                  setUserWantsToContinueWithoutSaving(true);
                  setShowNeedsAccountModal(false);
                }}
              >
                {Config.selfRegistration.continueWithoutSaving}
              </SecondaryButton>
            )}
          </div>

          <hr className="margin-y-3 margin-x-neg-4" />

          <div className="flex flex-column flex-align-center">
            <Content
              onClick={(): void => {
                analytics.event.guest_modal.click.go_to_myNJ_login();
                if (loginPageEnabled) {
                  router && router.push(ROUTES.login);
                } else {
                  triggerSignIn();
                }
              }}
            >
              {Config.selfRegistration.needsAccountModalSubText}
            </Content>
          </div>
        </div>
      </ModalZeroButton>
    </>
  );
};
