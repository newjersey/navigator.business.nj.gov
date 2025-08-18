import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";
import { ReviewLineItem } from "@/components/tasks/review-screen-components/ReviewLineItem";
import { isTradeNameLegalStructureApplicable } from "@/lib/domain-logic/isTradeNameLegalStructureApplicable";
import { formatUTCDate } from "@businessnjgovnavigator/shared/dateHelpers";

interface Props {
  business: Business;
}

export const ConfirmationPage = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const cigLicenseData = props.business.cigaretteLicenseData;

  return (
    <>
      <div className="maxw-tablet margin-x-auto">
        <div className="fdc fac" data-testid="cig-license-confirmation-page">
          <img className="margin-y-4 width-card-lg" src={`/img/email-sent.svg`} alt="" />
          <Heading level={2} className="margin-bottom-0">
            {Config.cigaretteLicenseConfirmation.paymentSuccessfulHeader}
          </Heading>
          <p className="text-center">{Config.cigaretteLicenseConfirmation.paymentSuccessfulInfo}</p>
        </div>

        <div>
          <hr className="width-full margin-top-4 margin-bottom-3" />

          <div className="grid-row">
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.confirmationNumber}
              value={cigLicenseData?.paymentInfo?.orderId?.toString()}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.dateSubmitted}
              value={formatUTCDate(cigLicenseData?.paymentInfo?.orderTimestamp || "")}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.amountPaid}
              value="$50"
              marginOverride="width-full margin-top-2 "
              noColonAfterLabel
            />
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={3} className="margin-bottom-0">
            {Config.cigaretteLicenseConfirmation.whatHappensNextHeader}
          </Heading>
          <p>{Config.cigaretteLicenseConfirmation.whatHappensNextInfo}</p>
          <ul>
            <li>{Config.cigaretteLicenseConfirmation.whatHappensNextBullet1}</li>
            <li>{Config.cigaretteLicenseConfirmation.whatHappensNextBullet2}</li>
          </ul>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={3}>{Config.cigaretteLicenseConfirmation.submissionDetails}</Heading>
          <Heading level={4} className="padding-top-05">
            {Config.cigaretteLicenseConfirmation.licenseeInformationHeader}
          </Heading>
          <div className="grid-row">
            {isTradeNameLegalStructureApplicable(props.business.profileData.legalStructureId) ? (
              <>
                <ReviewLineItem
                  label={Config.profileDefaults.fields.responsibleOwnerName.default.header}
                  value={cigLicenseData?.responsibleOwnerName}
                  marginOverride="width-full margin-top-1"
                  noColonAfterLabel
                />
                <ReviewLineItem
                  label={Config.profileDefaults.fields.tradeName.default.header}
                  value={cigLicenseData?.tradeName}
                  marginOverride="width-full margin-top-2"
                  noColonAfterLabel
                />
              </>
            ) : (
              <ReviewLineItem
                label={Config.profileDefaults.fields.businessName.default.header}
                value={cigLicenseData?.businessName}
                marginOverride="width-full margin-top-1"
                noColonAfterLabel
              />
            )}
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={4} className="padding-top-05">
            {Config.cigaretteLicenseStep2.businessAddressHeader}
          </Heading>
          <div className="grid-row">
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.businessAddressLine1}
              value={cigLicenseData?.addressLine1}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.businessAddressLine2}
              value={cigLicenseData?.addressLine2}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressCity.label}
              value={cigLicenseData?.addressCity}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressState.label}
              value={cigLicenseData?.addressState?.shortCode}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressZipCode.label}
              value={cigLicenseData?.addressZipCode}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={4} className="padding-top-05">
            {Config.cigaretteLicenseStep2.mailingAddressHeader}
          </Heading>
          <div className="grid-row">
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.mailingAddressLine1}
              value={cigLicenseData?.mailingAddressLine1}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.mailingAddressLine2}
              value={cigLicenseData?.mailingAddressLine2}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressCity.label}
              value={cigLicenseData?.mailingAddressCity}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressState.label}
              value={cigLicenseData?.mailingAddressState?.shortCode}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.formation.fields.addressZipCode.label}
              value={cigLicenseData?.mailingAddressZipCode}
              marginOverride="width-full margin-top-2"
              noColonAfterLabel
            />
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={4} className="padding-top-05">
            {Config.cigaretteLicenseStep2.contactInformationHeader}
          </Heading>
          <div className="grid-row">
            <ReviewLineItem
              label={Config.cigaretteLicenseStep2.fields.contactName.label}
              value={cigLicenseData?.contactName}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseStep2.fields.contactPhoneNumber.label}
              value={cigLicenseData?.contactPhoneNumber}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseStep2.fields.contactEmail.label}
              value={cigLicenseData?.contactEmail}
              marginOverride="width-full margin-top-1"
              ignoreContent
              noColonAfterLabel
            />
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={4} className="padding-top-05">
            {Config.cigaretteLicenseStep3.salesInformationHeader}
          </Heading>
          <div className="grid-row">
            <ReviewLineItem
              label={Config.cigaretteLicenseStep3.fields.startDateOfSales.label}
              value={formatUTCDate(cigLicenseData?.salesInfoStartDate || "")}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
            <ReviewLineItem
              label={Config.cigaretteLicenseConfirmation.suppliers}
              value={cigLicenseData?.salesInfoSupplier?.join(", ")}
              marginOverride="width-full margin-top-1"
              noColonAfterLabel
            />
          </div>

          <hr className="width-full margin-top-4 margin-bottom-3" />

          <Heading level={3} className="margin-bottom-0 padding-top-1">
            {Config.cigaretteLicenseConfirmation.needHelpHeader}
          </Heading>
          <div className="padding-bottom-1">
            <Content>{Config.cigaretteLicenseConfirmation.needHelpInfo}</Content>
          </div>

          <hr className="width-full margin-y-4" />
        </div>
      </div>
      <hr className="width-full margin-bottom-1" />
      <Content className="margin-bottom-neg-2 font-sans-2xs">
        {Config.cigaretteLicenseConfirmation.issuingAgency}
      </Content>
    </>
  );
};
