import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Alert } from "@/components/njwds-extended/Alert";
import { CtaContainer } from "@/components/njwds-extended/cta/CtaContainer";
import { Heading } from "@/components/njwds-extended/Heading";
import { LiveChatHelpButton } from "@/components/njwds-extended/LiveChatHelpButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ActionBarLayout } from "@/components/njwds-layout/ActionBarLayout";
import { Icon } from "@/components/njwds/Icon";
import { CigaretteSignatures } from "@/components/tasks/cigarette-license/CigaretteSignatures";
import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { ReviewSection } from "@/components/tasks/review-screen-components/ReviewSection";
import { ReviewSubSection } from "@/components/tasks/review-screen-components/ReviewSubSection";
import { AddressContext } from "@/contexts/addressContext";
import { CigaretteLicenseContext } from "@/contexts/cigaretteLicenseContext";
import { DataFormErrorMapContext } from "@/contexts/dataFormErrorMapContext";
import { ProfileDataContext } from "@/contexts/profileDataContext";
import * as api from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useFormContextFieldHelpers } from "@/lib/data-hooks/useFormContextFieldHelpers";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { isTradeNameLegalStructureApplicable } from "@/lib/domain-logic/isTradeNameLegalStructureApplicable";
import analytics from "@/lib/utils/analytics";
import { scrollToTopOfElement } from "@/lib/utils/helpers";
import { SubmissionError } from "@businessnjgovnavigator/shared/cigaretteLicense";
import { formatUTCDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useState } from "react";

interface Props {
  setStepIndex: (step: number) => void;
  setSubmissionError: (error: SubmissionError) => void;
  CMS_ONLY_show_error?: boolean;
  errorAlertRef: React.RefObject<HTMLDivElement>;
}

export const CigaretteLicenseReview = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { state: cigaretteLicenseData, saveCigaretteLicenseData } =
    useContext(CigaretteLicenseContext);
  const { state: profileDataState } = useContext(ProfileDataContext);
  const { state: addressState } = useContext(AddressContext);
  const { userData, business, updateQueue } = useUserData();
  const profileData = profileDataState.profileData;
  const [loading, setLoading] = useState(false);
  const formationAddressData = addressState.formationAddressData;
  const router = useRouter();

  const { setIsValid: setIsValidBusinessName } = useFormContextFieldHelpers(
    "businessName",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidResponsibleOwnerName } = useFormContextFieldHelpers(
    "responsibleOwnerName",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidTradeName } = useFormContextFieldHelpers(
    "tradeName",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidTaxId } = useFormContextFieldHelpers(
    "taxId",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressLine1 } = useFormContextFieldHelpers(
    "addressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressCity } = useFormContextFieldHelpers(
    "addressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressState } = useFormContextFieldHelpers(
    "addressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidAddressZipCode } = useFormContextFieldHelpers(
    "addressZipCode",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidMailingAddressLine1 } = useFormContextFieldHelpers(
    "mailingAddressLine1",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidMailingAddressCity } = useFormContextFieldHelpers(
    "mailingAddressCity",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidMailingAddressState } = useFormContextFieldHelpers(
    "mailingAddressState",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidMailingAddressZipCode } = useFormContextFieldHelpers(
    "mailingAddressZipCode",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidSalesInfoStartDate } = useFormContextFieldHelpers(
    "salesInfoStartDate",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidSalesInfoSupplier } = useFormContextFieldHelpers(
    "salesInfoSupplier",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidContactName } = useFormContextFieldHelpers(
    "contactName",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidContactPhoneNumber } = useFormContextFieldHelpers(
    "contactPhoneNumber",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidContactEmail } = useFormContextFieldHelpers(
    "contactEmail",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidSignature } = useFormContextFieldHelpers(
    "signature",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidSignerRelationship } = useFormContextFieldHelpers(
    "signerRelationship",
    DataFormErrorMapContext,
  );
  const { setIsValid: setIsValidSignerName } = useFormContextFieldHelpers(
    "signerName",
    DataFormErrorMapContext,
  );

  const validateAllFieldsWithData = (data: typeof cigaretteLicenseData): boolean => {
    let dataToValidate = { ...data };

    if (data.mailingAddressIsTheSame) {
      dataToValidate = {
        ...dataToValidate,
        mailingAddressLine1: data.addressLine1,
        mailingAddressLine2: data.addressLine2,
        mailingAddressCity: data.addressCity,
        mailingAddressState: data.addressState,
        mailingAddressZipCode: data.addressZipCode,
      };
    }

    let isValid = true;

    if (isTradeNameLegalStructureApplicable(profileData.legalStructureId)) {
      const isResponsibleOwnerNameValid = dataToValidate.responsibleOwnerName !== "";
      const isTradeNameValid = dataToValidate.tradeName !== "";
      setIsValidResponsibleOwnerName(isResponsibleOwnerNameValid);
      setIsValidTradeName(isTradeNameValid);
      if (!isResponsibleOwnerNameValid || !isTradeNameValid) isValid = false;
    } else {
      const isBusinessNameValid = dataToValidate.businessName !== "";
      setIsValidBusinessName(isBusinessNameValid);
      if (!isBusinessNameValid) isValid = false;
    }

    const validations = [
      { field: dataToValidate.taxId, setter: setIsValidTaxId },
      { field: dataToValidate.addressLine1, setter: setIsValidAddressLine1 },
      { field: dataToValidate.addressCity, setter: setIsValidAddressCity },
      { field: dataToValidate.addressState, setter: setIsValidAddressState },
      { field: dataToValidate.addressZipCode, setter: setIsValidAddressZipCode },
      { field: dataToValidate.mailingAddressLine1, setter: setIsValidMailingAddressLine1 },
      { field: dataToValidate.mailingAddressCity, setter: setIsValidMailingAddressCity },
      { field: dataToValidate.mailingAddressState, setter: setIsValidMailingAddressState },
      {
        field: dataToValidate.mailingAddressZipCode,
        setter: setIsValidMailingAddressZipCode,
      },
      { field: dataToValidate.salesInfoStartDate, setter: setIsValidSalesInfoStartDate },
      { field: dataToValidate.contactName, setter: setIsValidContactName },
      { field: dataToValidate.contactPhoneNumber, setter: setIsValidContactPhoneNumber },
      { field: dataToValidate.contactEmail, setter: setIsValidContactEmail },
      { field: dataToValidate.signature, setter: setIsValidSignature },
      { field: dataToValidate.signerRelationship, setter: setIsValidSignerRelationship },
      { field: dataToValidate.signerName, setter: setIsValidSignerName },
    ];

    for (const { field, setter } of validations) {
      setter(!!field);
      if (!field) isValid = false;
    }

    const isSalesInfoSupplierValid = !!(
      dataToValidate.salesInfoSupplier && dataToValidate.salesInfoSupplier.length > 0
    );
    setIsValidSalesInfoSupplier(isSalesInfoSupplierValid);
    if (!isSalesInfoSupplierValid) isValid = false;

    return isValid;
  };

  const handleSubmit = async (): Promise<void> => {
    analytics.event.cigarette_license.click.step_four_submit_button();

    setLoading(true);

    const isValid = validateAllFieldsWithData(cigaretteLicenseData);
    const returnUrl = window.location.origin + window.location.pathname;

    if (!isValid) {
      setLoading(false);
      analytics.event.cigarette_license.submit.validation_error();

      if (props.errorAlertRef.current) {
        scrollToTopOfElement(props.errorAlertRef.current, { focusElement: true });
      }
      return;
    }

    saveCigaretteLicenseData();
    props.setSubmissionError(undefined);

    if (!userData || !business?.cigaretteLicenseData) {
      setLoading(false);
      return;
    }

    try {
      await api.postUserData(userData);
      const cigaretteLicenseResponse = await api.postCigaretteLicensePreparePayment(
        userData,
        returnUrl,
      );

      if (cigaretteLicenseResponse && typeof cigaretteLicenseResponse === "object") {
        if (cigaretteLicenseResponse.paymentInfo?.errorResult) {
          analytics.event.cigarette_license.submit.service_error();
          props.setSubmissionError("UNAVAILABLE");
          setLoading(false);
          setTimeout(() => {
            if (props.errorAlertRef.current) {
              scrollToTopOfElement(props.errorAlertRef.current, { focusElement: true });
            }
          }, 100);
          return;
        }

        if (
          cigaretteLicenseResponse.paymentInfo?.token &&
          cigaretteLicenseResponse.paymentInfo?.htmL5RedirectUrl &&
          cigaretteLicenseResponse.userData &&
          router
        ) {
          updateQueue
            ?.queueBusiness({
              ...updateQueue.currentBusiness(),
              cigaretteLicenseData: {
                ...business.cigaretteLicenseData,
                lastUpdatedISO: new Date(Date.now()).toISOString(),
                paymentInfo: {
                  ...business.cigaretteLicenseData?.paymentInfo,
                  token: cigaretteLicenseResponse.paymentInfo.token,
                },
              },
            })
            .update();
          await router.replace(cigaretteLicenseResponse.paymentInfo?.htmL5RedirectUrl);
        }
      }
    } catch {
      setLoading(false);
      analytics.event.cigarette_license.submit.service_error();
      props.setSubmissionError("UNAVAILABLE");
      setTimeout(() => {
        if (props.errorAlertRef.current) {
          scrollToTopOfElement(props.errorAlertRef.current, { focusElement: true });
        }
      }, 100);
    }
  };

  return (
    <>
      <Alert variant="info" className="margin-bottom-4">
        <Content>{Config.cigaretteLicenseStep4.alertBeforeSubmit}</Content>
      </Alert>

      <ReviewSection
        headingText={Config.cigaretteLicenseStep4.reviewAndPayHeader}
        editHandleButtonClick={() => props.setStepIndex(1)}
      >
        {isTradeNameLegalStructureApplicable(profileData.legalStructureId) ? (
          <>
            <ReviewLineItem
              label={Config.profileDefaults.fields.responsibleOwnerName.default.header}
              value={cigaretteLicenseData.responsibleOwnerName || profileData.responsibleOwnerName}
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.profileDefaults.fields.tradeName.default.header}
              value={cigaretteLicenseData.tradeName || profileData.tradeName}
              noColonAfterLabel
            />
          </>
        ) : (
          <ReviewLineItem
            label={Config.profileDefaults.fields.businessName.default.header}
            value={cigaretteLicenseData.businessName || profileData.businessName}
            noColonAfterLabel
          />
        )}
        <ReviewLineItem
          label={Config.profileDefaults.fields.taxId.default.header}
          labelContextualInfo={Config.profileDefaults.fields.taxId.default.headerContextualInfo}
          value={cigaretteLicenseData.taxId || profileData.taxId}
          noColonAfterLabel
        />

        <ReviewSubSection header={Config.cigaretteLicenseStep4.businessAddressHeader}>
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.businessAddressLine1}
            value={cigaretteLicenseData.addressLine1}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.businessAddressLine2}
            value={cigaretteLicenseData.addressLine2}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.businessAddressCity}
            value={cigaretteLicenseData.addressCity}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.businessAddressState}
            value={cigaretteLicenseData.addressState?.name}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.businessAddressZipCode}
            value={cigaretteLicenseData.addressZipCode || formationAddressData.addressZipCode}
            noColonAfterLabel
          />
        </ReviewSubSection>

        <ReviewSubSection header={Config.cigaretteLicenseStep4.mailingAddressHeader}>
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.mailingAddressLine1}
            value={
              cigaretteLicenseData.mailingAddressIsTheSame
                ? cigaretteLicenseData.addressLine1
                : cigaretteLicenseData.mailingAddressLine1
            }
            noColonAfterLabel
            dataTestId="mailing-address-line1"
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.mailingAddressLine2}
            value={
              cigaretteLicenseData.mailingAddressIsTheSame
                ? cigaretteLicenseData.addressLine2
                : cigaretteLicenseData.mailingAddressLine2
            }
            noColonAfterLabel
            dataTestId="mailing-address-line2"
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.mailingAddressCity}
            value={
              cigaretteLicenseData.mailingAddressIsTheSame
                ? cigaretteLicenseData.addressCity
                : cigaretteLicenseData.mailingAddressCity
            }
            noColonAfterLabel
            dataTestId="mailing-address-city"
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.mailingAddressState}
            value={
              cigaretteLicenseData.mailingAddressIsTheSame
                ? cigaretteLicenseData.addressState?.name
                : cigaretteLicenseData.mailingAddressState?.name
            }
            noColonAfterLabel
            dataTestId="mailing-address-state"
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.mailingAddressZipCode}
            value={
              cigaretteLicenseData.mailingAddressIsTheSame
                ? cigaretteLicenseData.addressZipCode || formationAddressData.addressZipCode
                : cigaretteLicenseData.mailingAddressZipCode
            }
            noColonAfterLabel
            dataTestId="mailing-address-zipcode"
          />
        </ReviewSubSection>

        <ReviewSubSection header={Config.cigaretteLicenseStep4.contactInformationHeader}>
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.contactName}
            value={cigaretteLicenseData.contactName}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.contactPhoneNumber}
            value={cigaretteLicenseData.contactPhoneNumber}
            noColonAfterLabel
          />
          <ReviewLineItem
            label={Config.cigaretteLicenseStep4.reviewItems.contactEmail}
            value={cigaretteLicenseData.contactEmail}
            noColonAfterLabel
          />
        </ReviewSubSection>
      </ReviewSection>

      <ReviewSection
        headingText={Config.cigaretteLicenseStep4.salesInformationHeader}
        editHandleButtonClick={() => props.setStepIndex(2)}
      >
        <ReviewLineItem
          label={Config.cigaretteLicenseStep4.reviewItems.salesInfoStartDate}
          value={formatUTCDate(cigaretteLicenseData.salesInfoStartDate || "")}
          noColonAfterLabel
        />
        <ReviewLineItem
          label={Config.cigaretteLicenseStep4.reviewItems.salesInfoSupplier}
          value={cigaretteLicenseData.salesInfoSupplier?.join(", ")}
          noColonAfterLabel
        />
      </ReviewSection>

      <div className="margin-top-4">
        <Heading level={2}>{Config.cigaretteLicenseStep4.paymentHeader}</Heading>
        <div className="grid-row grid-gap margin-top-2">
          <div className="grid-col-8">
            <Content>{Config.cigaretteLicenseStep4.servicesLabelText}</Content>
          </div>
          <div className="grid-col-4">
            <Content>{Config.cigaretteLicenseStep4.costLabelText}</Content>
          </div>
        </div>

        <HorizontalLine />

        <div className="grid-row grid-gap margin-top-1">
          <div className="grid-col-8">
            <Content>{Config.cigaretteLicenseStep4.retailOverTheCounterLicenseLabelText}</Content>
          </div>
          <div className="grid-col-4">
            <span>{Config.cigaretteLicenseStep4.costValue}</span>
          </div>
        </div>
        <div className="grid-row grid-gap margin-top-2 bg-base-extra-light padding-2">
          <div className="grid-col-8">
            <Content>{Config.cigaretteLicenseStep4.totalLabelText}</Content>
          </div>
          <div className="grid-col-4">
            <span className="text-bold">{Config.cigaretteLicenseStep4.costValue}</span>
          </div>
        </div>
        <div className="text-small margin-top-2">
          <Content>{Config.cigaretteLicenseStep4.feesSubjectToChange}</Content>
        </div>
      </div>

      <HorizontalLine />

      <div>
        <CigaretteSignatures CMS_ONLY_show_error={props.CMS_ONLY_show_error} />
      </div>

      <HorizontalLine />

      <Content>{Config.cigaretteLicenseStep4.issuingAgency}</Content>

      <CtaContainer>
        <ActionBarLayout>
          <LiveChatHelpButton />
          <SecondaryButton
            isColor="primary"
            onClick={() => {
              analytics.event.cigarette_license.click.switch_to_step_three();
              props.setStepIndex(2);
            }}
          >
            {Config.cigaretteLicenseStep4.backButtonText}
          </SecondaryButton>
          <PrimaryButton isLoading={loading} isColor="primary" onClick={handleSubmit}>
            {Config.cigaretteLicenseStep4.submitAndPayButtonText}
            <Icon iconName="launch" className="margin-left-1" />
          </PrimaryButton>
        </ActionBarLayout>
      </CtaContainer>
    </>
  );
};
