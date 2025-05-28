import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { isAnyFieldEmpty } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/review-screen-components/ReviewSection";
import { ReviewSubSection } from "@/components/tasks/review-screen-components/ReviewSubSection";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import * as api from "@/lib/api-client/apiClient";
import { useAddressErrors } from "@/lib/data-hooks/useAddressErrors";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { formatAddress } from "@/lib/domain-logic/formatAddress";
import analytics from "@/lib/utils/analytics";
import { scrollToTop } from "@/lib/utils/helpers";
import {
  convertSignedByteArrayToUnsigned,
  LookupTaxClearanceCertificateAgenciesById,
  TaxClearanceCertificateResponseErrorType,
} from "@businessnjgovnavigator/shared";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
  setResponseErrorType: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void;
  formFuncWrapper: (
    onSubmitFunc: () => void | Promise<void>,
    onChangeFunc?:
      | ((isValid: boolean, errors: unknown[], pageChange: boolean) => void | Promise<void>)
      | undefined,
  ) => void;
}
export const Review = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { business, userData } = useUserData();
  const { doesRequiredFieldHaveError } = useAddressErrors();
  const requestingAgencyName = LookupTaxClearanceCertificateAgenciesById(
    business?.taxClearanceCertificateData?.requestingAgencyId,
  ).name;

  const isAddressComplete = Boolean(
    business?.taxClearanceCertificateData?.addressLine1 &&
      business?.taxClearanceCertificateData?.addressCity &&
      business?.taxClearanceCertificateData?.addressState &&
      business?.taxClearanceCertificateData?.addressZipCode,
  );

  let addressValue = "";

  if (isAddressComplete) {
    addressValue = formatAddress({
      addressLine1: business?.taxClearanceCertificateData?.addressLine1,
      addressLine2: business?.taxClearanceCertificateData?.addressLine2,
      addressCity: business?.taxClearanceCertificateData?.addressCity,
      addressState: business?.taxClearanceCertificateData?.addressState,
      addressZipCode: business?.taxClearanceCertificateData?.addressZipCode,
    });
  }

  const { setIsValid: setIsValidRequestingAgencyId } = useFormContextFieldHelpers(
    "requestingAgencyId",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidBusinessName } = useFormContextFieldHelpers(
    "businessName",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidCity } = useFormContextFieldHelpers(
    "addressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidState } = useFormContextFieldHelpers(
    "addressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidTaxId } = useFormContextFieldHelpers(
    "taxId",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidTaxPin } = useFormContextFieldHelpers(
    "taxPin",
    DataFormErrorMapContext,
  );

  // Update data error map based
  const handleOnClick = (): void => {
    if (!business || !userData || !business.taxClearanceCertificateData) {
      return;
    }
    if (business.taxClearanceCertificateData.requestingAgencyId === "") {
      setIsValidRequestingAgencyId(false);
    }
    if (business.taxClearanceCertificateData.businessName === "") {
      setIsValidBusinessName(false);
    }
    if (business.taxClearanceCertificateData.taxId === "") {
      setIsValidTaxId(false);
    }
    if (business.taxClearanceCertificateData.taxPin === "") {
      setIsValidTaxPin(false);
    }

    setIsValidAddressLine1(!doesRequiredFieldHaveError("addressLine1"));
    setIsValidCity(!doesRequiredFieldHaveError("addressCity"));
    setIsValidState(!doesRequiredFieldHaveError("addressState"));
    setIsValidZipCode(!doesRequiredFieldHaveError("addressZipCode"));
  };

  props.formFuncWrapper(async (): Promise<void> => {
    if (!business || !userData || !business.taxClearanceCertificateData) {
      return;
    }
    scrollToTop();

    // If any field is empty, do not submit the form
    if (isAnyFieldEmpty(business.taxClearanceCertificateData)) {
      return;
    }
    try {
      const taxClearanceResponse = await api.postTaxClearanceCertificate(userData);

      if (taxClearanceResponse.error) {
        analytics.event.tax_clearance.submit.validation_error();
        props.setResponseErrorType(taxClearanceResponse.error.type);
        return;
      }

      if (taxClearanceResponse.certificatePdfArray) {
        analytics.event.tax_clearance.appears.validation_success();
        const blob = new Blob(
          [
            new Uint8Array(
              convertSignedByteArrayToUnsigned(taxClearanceResponse.certificatePdfArray),
            ),
          ],
          {
            type: "application/pdf",
          },
        );
        props.setCertificatePdfBlob(blob);
        props.setResponseErrorType(undefined);
      }
    } catch {
      analytics.event.tax_clearance.submit.validation_error();
      props.setResponseErrorType("SYSTEM_ERROR");
    }
  });

  const handleBackButtonClick = (): void => {
    analytics.event.tax_clearance.click.switch_to_step_two();
    props.setStepIndex(1);
  };
  return (
    <>
      <ReviewSection
        headingText={Config.taxClearanceCertificateStep3.mainTitleHeader}
        editHandleButtonClick={() => props.setStepIndex(1)}
        disableHorizontalLine
      >
        <ReviewSubSection
          header={Config.taxClearanceCertificateStep3.firstSectionHeader}
          marginOverride="margin-top-0"
        >
          <ReviewLineItem
            label={Config.taxClearanceCertificateStep3.certificationReasonLabel}
            value={requestingAgencyName}
            dataTestId={"requestingAgencyId"}
            noColonAfterLabel
          />
        </ReviewSubSection>
        <hr className={"margin-y-3-override"} />
        <ReviewSubSection
          header={Config.taxClearanceCertificateStep3.secondSectionHeader}
          marginOverride="margin-top-0"
        >
          <ReviewLineItem
            label={Config.taxClearanceCertificateStep3.businessNameLabel}
            value={business?.taxClearanceCertificateData?.businessName}
            dataTestId={"businessName"}
          />
          <ReviewLineItem
            label={Config.taxClearanceCertificateStep3.addressLabel}
            value={addressValue}
            dataTestId={"addressLabel"}
          />
          <ReviewLineItem
            label={Config.taxClearanceCertificateStep3.stateTaxIdLabel}
            value={business?.taxClearanceCertificateData?.taxId}
            dataTestId={"stateTaxIdLabel"}
          />
          <ReviewLineItem
            label={Config.taxClearanceCertificateStep3.taxPinLabel}
            // A masked tax pin is "****", which is not rendered as literal text in markdown.
            value={business?.taxClearanceCertificateData?.taxPin?.replace("*", "&ast;")}
            dataTestId={"taxPinLabel"}
          />
        </ReviewSubSection>
      </ReviewSection>
      <div className="margin-top-5">
        <CtaContainer>
          <ActionBarLayout>
            <LiveChatHelpButton />
            <div className="margin-top-2 mobile-lg:margin-top-0">
              <SecondaryButton
                isColor="primary"
                onClick={handleBackButtonClick}
                dataTestId="previous-button"
              >
                {Config.taxClearanceCertificateShared.backButtonText}
              </SecondaryButton>
            </div>
            <PrimaryButton
              isColor="primary"
              onClick={handleOnClick}
              isRightMarginRemoved={true}
              dataTestId="next-button"
              isSubmitButton={true}
            >
              {Config.taxClearanceCertificateShared.saveButtonText}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      </div>
    </>
  );
};
