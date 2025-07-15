import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
}

export const GeneralInfo = (props: Props): ReactElement => {
  const { Config } = useConfig();

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
            onClick={() => props.setStepIndex(1)}
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
