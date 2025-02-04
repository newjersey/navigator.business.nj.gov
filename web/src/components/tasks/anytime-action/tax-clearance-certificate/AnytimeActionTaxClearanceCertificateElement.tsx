import { ButtonIcon } from "@/components/ButtonIcon";
import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { HorizontalStepper } from "@/components/njwds-extended/HorizontalStepper";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { AnytimeActionTaxClearanceCertificateEligibiityElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnytimeActionTaxClearanceCertificateEligibiityElement";
import { AnyTimeActionTaxClearanceCertificateReviewElement } from "@/components/tasks/anytime-action/tax-clearance-certificate/AnyTimeActionTaxClearanceCertificateReviewElement";
import { TaxClearanceCertificateContext } from "@/contexts/taxClearanceCertificateContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement, AnytimeActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import {
  emptyTaxClearanceCertificate,
  TaxClearanceCertificate,
} from "@businessnjgovnavigator/shared/taxClearanceCertificate";
import { ReactElement, useState } from "react";

interface Props {
  anytimeAction: AnytimeActionLicenseReinstatement | AnytimeActionTask;
  CMS_ONLY_stepIndex?: number;
}

export const AnytimeActionTaxClearanceCertificateElement = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [stepIndex, setStepIndex] = useState(props.CMS_ONLY_stepIndex ?? 0);
  const TaxClearanceCertificateSteps = [
    { name: "Requirements", hasError: false, isComplete: false },
    { name: "Check Eligibility", hasError: false, isComplete: false },
    { name: "Review", hasError: false, isComplete: false },
  ];
  const [stateTaxClearanceCertificateSteps, setStateTaxClearanceCertificateSteps] = useState(
    TaxClearanceCertificateSteps
  );
  const [taxClearanceCertificate, setTaxClearanceCertificate] = useState<TaxClearanceCertificate>(
    emptyTaxClearanceCertificate()
  );
  const { business,updateQueue } = useUserData();

  useMountEffectWhenDefined(() => {
    if (business) {
      if(business.taxClearanceCertificateData?.businessName){
        setTaxClearanceCertificate({
          businessName: business.taxClearanceCertificateData.businessName,
          entityId: business.profileData.entityId,
          issuingAgency: business.taxClearanceCertificateData.issuingAgency,
          taxId: business.profileData.taxId,
          encryptedTaxId: business.profileData.encryptedTaxId,
          taxPin: business.profileData.taxPin,
          addressLine1: business.taxClearanceCertificateData.addressLine1,
          addressLine2: business.taxClearanceCertificateData.addressLine2,
          addressCity: business.taxClearanceCertificateData.addressCity,
          addressState: business.taxClearanceCertificateData.addressState,
          addressZipCode: business.taxClearanceCertificateData.addressZipCode,
          addressProvince: business.taxClearanceCertificateData.addressProvince,
          addressCountry: business.taxClearanceCertificateData.addressCountry,
        });
      }else {
        setTaxClearanceCertificate({
          businessName: business.profileData.businessName,
          entityId: business.profileData.entityId,
          issuingAgency: undefined,
          taxId: business.profileData.taxId,
          encryptedTaxId: business.profileData.encryptedTaxId,
          taxPin: business.profileData.taxPin,
          addressLine1: business.formationData.formationFormData.addressLine1,
          addressLine2: business.formationData.formationFormData.addressLine2,
          addressCity: business.formationData.formationFormData.addressCity,
          addressState: business.formationData.formationFormData.addressState,
          addressZipCode: business.formationData.formationFormData.addressZipCode,
          addressProvince: business.formationData.formationFormData.addressProvince,
          addressCountry: business.formationData.formationFormData.addressCountry,
        });
      }
    }
  }, business);

  const updateTaxClearanceCertificateData = (): void => {
    if (!updateQueue) {
      return;
    }

    updateQueue.queueTaxClearanceCertificateData(
      taxClearanceCertificate
    );
  }

  return (
    <>
      <TaxClearanceCertificateContext.Provider
        value={{
          taxClearanceCertificateState: { taxClearanceCertificate: taxClearanceCertificate },
          setTaxClearanceCertificateState: setTaxClearanceCertificate,
        }}
      >
        <div className="min-height-38rem">
          <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
            <div className="padding-y-4 margin-x-4 margin-bottom-2">
              <h1>{props.anytimeAction.name}</h1>
            </div>
          </div>
          <HorizontalStepper
            steps={stateTaxClearanceCertificateSteps}
            currentStep={stepIndex}
            onStepClicked={(step: number): void => {
              setStateTaxClearanceCertificateSteps((prevState) => {
                const newState = [...prevState];
                newState[0].isComplete = step !== 0;
                return newState;
              });
              setStepIndex(step);
            }}
          />
          {stepIndex === 0 && (
            <div data-testid={"requirements-tab"}>
              <Content>{Config.taxClearanceCertificateStep1.content}</Content>
              <HorizontalLine />
              <span>{Config.taskDefaults.issuingAgencyText}: </span>
              <span>{Config.taxClearanceCertificateStep1.issuingAgencyText}</span>
            </div>
          )}
          {stepIndex === 1 && (
            <div data-testid={"eligibility-tab"}>
              <AnytimeActionTaxClearanceCertificateEligibiityElement />
            </div>
          )}
          {stepIndex === 2 && (
            <div data-testid={"review-tab"}>
              <AnyTimeActionTaxClearanceCertificateReviewElement />
            </div>
          )}
        </div>
        <CtaContainer>
          <ActionBarLayout>
            <div className="flex fac margin-top-3 mobile-lg:margin-top-0 mobile-lg:margin-left-auto mobile-lg:margin-right-3 width-full mobile-lg:width-auto">
              <UnStyledButton
                isBgTransparent
                className={"text-accent-cool-darker fjc padding-0"}
                isTextBold
                isIntercomEnabled
                dataTestid={"help-button"}
                onClick={(): void => analytics.event.business_formation_help_button.click.open_live_chat()}
              >
                <ButtonIcon svgFilename="help-circle-blue" sizePx="25px" />
                {Config.taxClearanceCertificateShared.helpButtonText}
              </UnStyledButton>
            </div>
            {stepIndex === 0 && (
              <>
                <PrimaryButton
                  isColor="primary"
                  onClick={(): void => {
                    setStepIndex(stepIndex + 1);
                  }}
                  dataTestId="cta-primary-1"
                >
                  {Config.taxClearanceCertificateShared.continueButtonText}
                </PrimaryButton>
              </>
            )}
            {stepIndex !== 0 && (
              <>
                <SecondaryButton
                  isColor="primary"
                  onClick={(): void => {
                    setStepIndex(stepIndex - 1);
                  }}
                  dataTestId="cta-secondary-1"
                >
                  Back
                </SecondaryButton>
                <PrimaryButton
                  isColor="primary"
                  onClick={(): void => {
                    if (stepIndex !== TaxClearanceCertificateSteps.length - 1) {
                      setStepIndex(stepIndex + 1);
                    }

                    if(stepIndex===1) {
                      updateTaxClearanceCertificateData();
                    }
                  }}
                  dataTestId="cta-primary-2"
                >
                  {Config.taxClearanceCertificateShared.saveButtonText}
                </PrimaryButton>
              </>
            )}
          </ActionBarLayout>
        </CtaContainer>
      </TaxClearanceCertificateContext.Provider>
    </>
  );
};
