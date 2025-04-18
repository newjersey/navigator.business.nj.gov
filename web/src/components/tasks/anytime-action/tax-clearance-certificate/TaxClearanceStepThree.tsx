import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/review-screen-components/ReviewSection";
import { ReviewSubSection } from "@/components/tasks/review-screen-components/ReviewSubSection";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { formatAddress } from "@/lib/domain-logic/formatAddress";
import { scrollToTop } from "@/lib/utils/helpers";
import { LookupTaxClearanceCertificateAgenciesById } from "@businessnjgovnavigator/shared";
import { convertSignedByteArrayToUnsigned } from "@businessnjgovnavigator/shared/intHelpers";
import { ReactElement } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  setCertificatePdfBlob: (certificatePdfBlob: Blob) => void;
}
export const TaxClearanceStepThree = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { userData, business } = useUserData();

  const requestingAgencyName = LookupTaxClearanceCertificateAgenciesById(
    business?.taxClearanceCertificateData?.requestingAgencyId
  ).name;

  const isAddressComplete = Boolean(
    business?.taxClearanceCertificateData?.addressLine1 &&
      business?.taxClearanceCertificateData?.addressCity &&
      business?.taxClearanceCertificateData?.addressState &&
      business?.taxClearanceCertificateData?.addressZipCode
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

  const handleButtonClick = async (): Promise<void> => {
    if (!userData) return;
    const taxClearanceResponse = await api.postTaxClearanceCertificate(userData);
    if (taxClearanceResponse.certificatePdfArray) {
      const blob = new Blob(
        [new Uint8Array(convertSignedByteArrayToUnsigned(taxClearanceResponse.certificatePdfArray))],
        {
          type: "application/pdf",
        }
      );
      props.setCertificatePdfBlob(blob);
    }

    // TODO: Error Response will be addressed in a separate ticket
    // Note: if there is a server error, we may return a 500 status code, or
    // return the error object with type = NATURAL_PROGRAM_ERROR
    scrollToTop();
  };

  return (
    <>
      <div data-testid={"review-tab"}>
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
              value={business?.taxClearanceCertificateData?.taxPin}
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
                  onClick={() => props.setStepIndex(1)}
                  dataTestId="previous-button"
                >
                  {Config.taxClearanceCertificateShared.backButtonText}
                </SecondaryButton>
              </div>
              <PrimaryButton
                isColor="primary"
                onClick={handleButtonClick}
                isRightMarginRemoved={true}
                dataTestId="next-button"
              >
                {Config.taxClearanceCertificateShared.saveButtonText}
              </PrimaryButton>
            </ActionBarLayout>
          </CtaContainer>
        </div>
      </div>
    </>
  );
};
