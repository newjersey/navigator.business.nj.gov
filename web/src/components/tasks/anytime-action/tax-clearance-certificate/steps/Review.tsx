import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { isAnyRequiredFieldEmpty } from "@/components/tasks/anytime-action/tax-clearance-certificate/helpers";
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
  TaxClearanceCertificateData,
  TaxClearanceCertificateResponseErrorType,
} from "@businessnjgovnavigator/shared";
import { ReactElement, useState } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
  setResponseErrorType: (errorType: TaxClearanceCertificateResponseErrorType | undefined) => void;
  isValid: () => boolean;
  saveTaxClearanceCertificateData: () => void;
}
export const Review = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { doesRequiredFieldHaveError } = useAddressErrors();
  const { userData, business, updateQueue } = useUserData();
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
  const updateErrorMap = (taxClearanceData: TaxClearanceCertificateData): void => {
    setIsValidRequestingAgencyId(taxClearanceData.requestingAgencyId !== "");
    setIsValidBusinessName(taxClearanceData.businessName !== "");
    setIsValidTaxId(taxClearanceData.taxId !== "");
    setIsValidTaxPin(taxClearanceData.taxPin !== "");

    setIsValidAddressLine1(!doesRequiredFieldHaveError("addressLine1"));
    setIsValidCity(!doesRequiredFieldHaveError("addressCity"));
    setIsValidState(!doesRequiredFieldHaveError("addressState"));
    setIsValidZipCode(!doesRequiredFieldHaveError("addressZipCode"));
  };

  const handleSubmit = async (): Promise<void> => {
    setIsLoading(true);

    try {
      if (!userData || !business?.taxClearanceCertificateData) return;

      scrollToTop();
      props.setResponseErrorType(undefined);
      updateErrorMap(business.taxClearanceCertificateData);

      if (isAnyRequiredFieldEmpty(business.taxClearanceCertificateData) || !props.isValid()) return;

      await api.postUserData(userData); // Need to assert that all businesses in a user's account have hashed data in DB
      const taxClearanceResponse = await api.postTaxClearanceCertificate(userData);
      if ("error" in taxClearanceResponse) {
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
        updateQueue?.queue(taxClearanceResponse.userData).update();
      }
    } catch {
      analytics.event.tax_clearance.submit.validation_error();
      props.setResponseErrorType("SYSTEM_ERROR");
    } finally {
      setIsLoading(false);
    }
  };

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
            <LiveChatHelpButton
              analyticsEvent={
                analytics.event.tax_clearance_anytime_action_help_button.click.open_live_chat
              }
            />
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
              onClick={() => !isLoading && handleSubmit()}
              isRightMarginRemoved={true}
              dataTestId="next-button"
              isLoading={isLoading}
            >
              {Config.taxClearanceCertificateShared.saveButtonText}
            </PrimaryButton>
          </ActionBarLayout>
        </CtaContainer>
      </div>
    </>
  );
};
