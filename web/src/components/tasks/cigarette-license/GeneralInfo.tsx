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

export const GeneralInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const { updateQueue } = useUserData();

  const onContinueClick = (): void => {
    if (isAuthenticated === IsAuthenticated.FALSE) {
      updateQueue?.queuePreferences({ returnToLink: ROUTES.cigaretteLicense }).update();
      setShowNeedsAccountModal(true);
    } else {
      analytics.event.cigarette_license.click.step_one_continue_button();
      props.setStepIndex(1);
    }
  };

  return (
    <>
      <Content>{Config.cigaretteLicenseStep1.content}</Content>
      <HorizontalLine />
      <span className="h5-styling">{Config.cigaretteLicenseShared.issuingAgencyLabelText}: </span>
      <span className="h6-styling">{Config.cigaretteLicenseShared.issuingAgencyText}</span>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <PrimaryButton
            isColor="primary"
            onClick={onContinueClick}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.cigaretteLicenseStep1.continueButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
