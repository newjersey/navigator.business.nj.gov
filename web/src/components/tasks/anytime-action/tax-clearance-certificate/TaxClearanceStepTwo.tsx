import { UnitesStatesAddress } from "@/components/data-fields/address/UnitesStatesAddress";
import { BusinessName } from "@/components/data-fields/BusinessName";
import { TaxId } from "@/components/data-fields/tax-id/TaxId";
import { TaxClearanceCertificateAgencyDropdown } from "@/components/data-fields/TaxClearanceCertificateAgencyDropdown";
import { TaxPin } from "@/components/data-fields/TaxPin";
import { HorizontalLine } from "@/components/HorizontalLine";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ProfileField } from "@/components/profile/ProfileField";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { FormEvent, ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  saveTaxClearanceCertificateData: () => void;
  onSave: (event?: FormEvent<HTMLFormElement>) => void;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
}

export const TaxClearanceStepTwo = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const { doesFieldHaveError } = useAddressErrors();
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext
  );
  const { setIsValid: setIsValidAddressLine2 } = useFormContextFieldHelpers(
    "addressLine2",
    DataFormErrorMapContext
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers("addressCity", DataFormErrorMapContext);
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers("addressState", DataFormErrorMapContext);
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext
  );

  const onValidation = (): void => {
    setIsValidAddressLine1(!doesFieldHaveError("addressLine1"));
    setIsValidAddressLine2(!doesFieldHaveError("addressLine2"));
    setIsValidCity(!doesFieldHaveError("addressCity"));
    setIsValidState(!doesFieldHaveError("addressState"));
    setIsValidZipCode(!doesFieldHaveError("addressZipCode"));
  };

  const handleSaveButtonClick = (): void => {
    props.onSave();
    props.onSubmit();
  };

  return (
    <>
      <div>
        <Heading level={2} styleVariant={"h3"}>
          {Config.taxClearanceCertificateStep2.requestingAgencySectionHeader}
        </Heading>
        <div id={`question-requestingAgencyId`} data-testid={"requestingAgency"}>
          <TaxClearanceCertificateAgencyDropdown />
        </div>
        <HorizontalLine />
        <div className="margin-top-3">
          <Heading level={2} styleVariant={"h3"}>
            {Config.taxClearanceCertificateStep2.businessInformationSectionHeader}
          </Heading>
        </div>
        <div className="margin-y-2">
          <ProfileField fieldName={"businessName"} hideLine={true} hideTopSpace={true} isFullWidth={true}>
            <BusinessName
              inputWidth="full"
              required={true}
              validationText={Config.taxClearanceCertificateShared.businessNameErrorText}
            />
          </ProfileField>
        </div>
        <div className="margin-y-2">
          <UnitesStatesAddress excludeNJ={false} onValidation={onValidation} required={true} isFullWidth />
        </div>
        <div className="margin-y-2">
          <ProfileField fieldName="taxId" hideLine={true} hideTopSpace={true} isFullWidth={true}>
            <TaxId inputWidth="full" required={true} />
          </ProfileField>
        </div>
        <div>
          <ProfileField fieldName="taxPin" hideLine={true} hideTopSpace={true} isFullWidth={true}>
            <TaxPin inputWidth="full" required={true} />
          </ProfileField>
        </div>
      </div>
      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <div className="margin-top-2 mobile-lg:margin-top-0">
            <SecondaryButton isColor="primary" onClick={() => props.setStepIndex(0)}>
              {Config.taxClearanceCertificateShared.backButtonText}
            </SecondaryButton>
          </div>
          <PrimaryButton isColor="primary" onClick={handleSaveButtonClick} isRightMarginRemoved={true}>
            {Config.taxClearanceCertificateShared.saveButtonText}
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
