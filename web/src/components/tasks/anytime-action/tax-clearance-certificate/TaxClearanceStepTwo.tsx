import { Content } from "@/components/Content";
import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { EntityId } from "@/components/data-fields/EntityId";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxClearanceCertificateAgencyDropdown } from "@/components/data-fields/TaxClearanceCertificateAgencyDropdown";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { FieldLabelProfile } from "@/components/field-labels/FieldLabelProfile";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  saveTaxClearanceCertificateData: () => void;
}

export const TaxClearanceStepTwo = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const handleSaveButtonClick = (): void => {
    props.setStepIndex(2);
    props.saveTaxClearanceCertificateData();
  };

  return (
    <>
      <div data-testid={"eligibility-tab"}>
        <Heading level={2} styleVariant={"h3"}>
          {Config.taxClearanceCertificateStep2.requestingAgencySectionHeader}
        </Heading>
        <Content className={"text-bold margin-bottom-05"}>
          {Config.taxClearanceCertificateStep2.requestingAgencyLabel}
        </Content>
        <TaxClearanceCertificateAgencyDropdown />
        <HorizontalLine />
        <div className="margin-top-3">
          <Heading level={2} styleVariant={"h3"}>
            {Config.taxClearanceCertificateStep2.businessInformationSectionHeader}
          </Heading>
        </div>
        <div className="margin-bottom-2">
          <FieldLabelProfile fieldName={"businessName"} />
          <BusinessName inputWidth="full" />
        </div>
        <FieldLabelProfile fieldName={"entityId"} />
        <EntityId inputWidth="full" />

        <div className="margin-y-2">
          <UnitesStatesAddress excludeNJ={false} onValidation={() => {}} isFullWidth />
        </div>
        <div className="margin-bottom-2">
          <FieldLabelProfile fieldName="taxId" />
          <TaxId inputWidth="full" />
        </div>

        <FieldLabelProfile fieldName="taxPin" />
        <TaxPin inputWidth="full" />
      </div>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton
              isColor="primary"
              onClick={() => props.setStepIndex(0)}
              dataTestId="previous-button"
            >
              {Config.taxClearanceCertificateShared.backButtonText}
            </SecondaryButton>
          </div>
          <PrimaryButton
            isColor="primary"
            onClick={handleSaveButtonClick}
            isRightMarginRemoved={true}
            dataTestId="next-button"
          >
            {Config.taxClearanceCertificateShared.saveButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
