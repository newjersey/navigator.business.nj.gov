import { Content } from "@/components/Content";
import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext } from "react";

export const NeedsAccountModal = (): ReactElement => {
  const { business } = useUserData();
  const router = useRouter();
  const { isAuthenticated, showNeedsAccountModal, setShowNeedsAccountModal } =
    useContext(NeedsAccountContext);
  const { Config } = useConfig();

  useMountEffectWhenDefined(() => {
    if (isAuthenticated === IsAuthenticated.TRUE) {
      setShowNeedsAccountModal(false);
    }
  }, isAuthenticated);

  if (isAuthenticated === IsAuthenticated.TRUE) {
    return <></>;
  }

  const linkToAccountSetup = (): void => {
    if (business?.preferences.returnToLink === `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`) {
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
          </div>

          <hr className="margin-y-3 margin-x-neg-4" />

          <div className="flex flex-column flex-align-center">
            <Content
              onClick={(): void => {
                analytics.event.guest_modal.click.go_to_myNJ_login();
                router && router.push(ROUTES.login);
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
