import { ButtonIcon } from "@/components/ButtonIcon";
import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (currStepIndex: number) => void;
}
export const TaxClearanceStepOne = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <>
      <div data-testid={"requirements-tab"}>
        <Content>{Config.taxClearanceCertificateStep1.content}</Content>
        <HorizontalLine />
        <span className="h5-styling">{Config.taxClearanceCertificateStep1.issuingAgencyLabelText}: </span>
        <span className="h6-styling">{Config.taxClearanceCertificateStep1.issuingAgencyText}</span>
        <CtaContainer>
          <ActionBarLayout>
            <div className="flex fac margin-top-3 mobile-lg:margin-top-0 mobile-lg:margin-left-auto mobile-lg:margin-right-3 width-full mobile-lg:width-auto">
              <UnStyledButton
                isBgTransparent
                className={"text-accent-cool-darker fjc padding-0"}
                isTextBold
                isIntercomEnabled
                dataTestid={"help-button"}
              >
                <ButtonIcon svgFilename="help-circle-blue" sizePx="25px" />
                {Config.taxClearanceCertificateShared.helpButtonText}
              </UnStyledButton>
            </div>

            <PrimaryButton
              isColor="primary"
              onClick={(): void => {
                props.setStepIndex(1);
              }}
              dataTestId="cta-primary-1"
              isRightMarginRemoved={true}
            >
              {Config.taxClearanceCertificateStep1.continueButtonText}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      </div>
    </>
  );
};
