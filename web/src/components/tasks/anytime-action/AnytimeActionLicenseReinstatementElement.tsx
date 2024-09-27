import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { LicenseCurrentStatusComponent } from "@/components/tasks/LicenseCurrentStatusComponent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseReinstatement } from "@/lib/types/types";
import {
  Business,
  defaultDateFormat,
  LicenseName,
  licenseSearchDateFormat,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared/";
import { ReactElement } from "react";

interface Props {
  anytimeActionLicenseReinstatement: AnytimeActionLicenseReinstatement;
  CMS_ONLY_fakeBusiness?: Business;
  CMS_ONLY_fakeLicenseName?: LicenseName;
}

export const AnytimeActionLicenseReinstatementElement = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const licenseName = props.CMS_ONLY_fakeLicenseName ?? props.anytimeActionLicenseReinstatement.licenseName;
  const licenseDetails = business?.licenseData?.licenses?.[licenseName];

  return (
    <div className="min-height-38rem">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.anytimeActionLicenseReinstatement.name}</h1>
          <div>
            <span className="text-bold">
              {
                Config.anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults
                  .licenseExpirationHeaderText
              }
            </span>{" "}
            {licenseDetails?.expirationDateISO &&
              parseDateWithFormat(licenseDetails.expirationDateISO, defaultDateFormat).format(
                licenseSearchDateFormat
              )}
          </div>
        </div>
      </div>

      <div className="margin-top-3">
        <Content>{props.anytimeActionLicenseReinstatement.summaryDescriptionMd}</Content>
      </div>
      <HorizontalLine />

      <LicenseCurrentStatusComponent licenseData={business?.licenseData} licenseName={licenseName} />

      <Content>{props.anytimeActionLicenseReinstatement.contentMd}</Content>

      <HorizontalLine />
      <span className="h5-styling" data-testid="form-id-header">
        {Config.filingDefaults.issuingAgencyText} &nbsp;
      </span>
      <span className="h6-styling">{props.anytimeActionLicenseReinstatement.issuingAgency}</span>

      {props.anytimeActionLicenseReinstatement.callToActionLink &&
        props.anytimeActionLicenseReinstatement.callToActionText && (
          <SingleCtaLink
            link={props.anytimeActionLicenseReinstatement.callToActionLink}
            text={props.anytimeActionLicenseReinstatement.callToActionText}
          />
        )}
    </div>
  );
};
