import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { LicenseCurrentStatusComponent } from "@/components/tasks/LicenseCurrentStatusComponent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { LicenseEventType } from "@/lib/types/types";
import { parseDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { LicenseName, licenseSearchDateFormat } from "@businessnjgovnavigator/shared/license";
import { LicenseEventSubtype } from "@businessnjgovnavigator/shared/taxFiling";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface LicenseElementProps {
  license: LicenseEventType;
  licenseEventType: LicenseEventSubtype;
  licenseName: string;
  CMS_ONLY_fakeBusiness?: Business;
  CMS_ONLY_fakeLicenseName?: LicenseName;
}

export const LicenseElement = (props: LicenseElementProps): ReactElement => {
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const { Config } = useConfig();

  const licenseName = props.CMS_ONLY_fakeLicenseName ?? props.license.licenseName;
  const licenseDetails = business?.licenseData?.licenses?.[licenseName];
  const expirationDateISO = licenseDetails?.expirationDateISO;

  let date = parseDate(expirationDateISO);
  if (props.licenseEventType === "renewal") {
    date = date.add(30, "days");
  }

  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>
            {props.licenseEventType === "renewal"
              ? props.license.renewalEventDisplayName
              : props.license.expirationEventDisplayName}
          </h1>
          <div>
            <span className="text-bold">
              {
                Config.anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults
                  .licenseExpirationHeaderText
              }
            </span>{" "}
            {licenseDetails?.expirationDateISO &&
              parseDateWithFormat(date.format(defaultDateFormat), defaultDateFormat).format(
                licenseSearchDateFormat
              )}
          </div>
        </div>
      </div>
      <div className="margin-top-3">
        <Content>{props.license.disclaimerText}</Content>
      </div>
      <HorizontalLine />

      {props.license.summaryDescriptionMd && (
        <>
          <div className="margin-top-3">
            <Content>{props.license.summaryDescriptionMd}</Content>
          </div>
          <HorizontalLine />
        </>
      )}

      <LicenseCurrentStatusComponent licenseData={business?.licenseData} licenseName={licenseName} />

      <Content>{props.license.contentMd}</Content>

      <HorizontalLine />
      <span className="h5-styling" data-testid="form-id-header">
        {Config.filingDefaults.issuingAgencyText} &nbsp;
      </span>
      <span className="h6-styling">{props.license.issuingAgency}</span>

      {props.license.callToActionLink && props.license.callToActionText && (
        <SingleCtaLink link={props.license.callToActionLink} text={props.license.callToActionText} />
      )}
    </div>
  );
};
