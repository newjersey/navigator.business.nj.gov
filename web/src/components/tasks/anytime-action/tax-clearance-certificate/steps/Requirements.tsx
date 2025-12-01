import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { ReactElement, useContext } from "react";

interface Props {
  setStepIndex: (step: number) => void;
}

export const Requirements = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { updateQueue } = useUserData();

  const onContinueClick = (): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      updateQueue?.queuePreferences({ returnToLink: ROUTES.taxClearanceCertificate }).update();
      setShowNeedsAccountModal(true);
    } else {
      analytics.event.tax_clearance.click.switch_to_step_two();
      props.setStepIndex(1);
    }
  };

  return (
    <>
      <Content>{Config.taxClearanceCertificateStep1.content}</Content>
      <HorizontalLine />
      <span className="h5-styling">
        {Config.taxClearanceCertificateStep1.issuingAgencyLabelText}:{" "}
      </span>
      <span className="h6-styling">{Config.taxClearanceCertificateStep1.issuingAgencyText}</span>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton
            analyticsEvent={
              analytics.event.tax_clearance_anytime_action_help_button.click.open_live_chat
            }
          />
          <PrimaryButton
            isColor="primary"
            onClick={onContinueClick}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.taxClearanceCertificateStep1.continueButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
