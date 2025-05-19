import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
}

export const TaxClearanceCertificateForm = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <Content>{Config.taxClearanceCertificateStep2.content}</Content>
      <HorizontalLine />
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <SecondaryButton
            isColor="secondary"
            onClick={(): void => props.setStepIndex(0)}
            dataTestId="cta-secondary-1"
          >
            {Config.taxClearanceCertificateStep2.backButtonText}
          </SecondaryButton>
          <PrimaryButton
            isColor="primary"
            onClick={(): void => props.setStepIndex(2)}
            dataTestId="cta-primary-1"
            isRightMarginRemoved={true}
          >
            {Config.taxClearanceCertificateStep2.continueButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
