import { ChecklistTag } from "@/components/ChecklistTag";
import { Content } from "@/components/Content";
import { HorizontalLine } from "@/components/HorizontalLine";
import { SingleCtaLink } from "@/components/njwds-extended/cta/SingleCtaLink";
import { Icon } from "@/components/njwds/Icon";
import { LicenseStatusHeader } from "@/components/tasks/LicenseStatusHeader";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { AnytimeActionLicenseRenewal } from "@/lib/types/types";
import {
  Business,
  defaultDateFormat,
  LicenseName,
  licenseSearchDateFormat,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared/";
import { LicenseStatusItem } from "@businessnjgovnavigator/shared/license";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  anytimeActionLicenseRenewal: AnytimeActionLicenseRenewal;
  CMS_ONLY_fakeBusiness?: Business;
  CMS_ONLY_fakeLicenseName?: LicenseName;
}

export const AnytimeActionLicenseRenewalElement = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const userDataFromHook = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? userDataFromHook.business;
  const licenseName = props.CMS_ONLY_fakeLicenseName ?? props.anytimeActionLicenseRenewal.licenseName;
  const licenseDetails = business?.licenseData?.licenses?.[licenseName];

  const getOneLineAddress = (): string => {
    const nameAndAddress = licenseDetails?.nameAndAddress;
    if (!nameAndAddress) {
      return "";
    }
    const secondLineAddress = nameAndAddress.addressLine2 ? ` ${nameAndAddress.addressLine2}` : "";
    return `${nameAndAddress.addressLine1}${secondLineAddress}, ${nameAndAddress.zipCode} NJ`.toUpperCase();
  };

  const receiptItem = (item: LicenseStatusItem, index: number): ReactElement => {
    return (
      <div key={index} data-testid={`item-${item.status}`}>
        <div
          className={`flex flex-column fac tablet-flex-row width-full ${
            index === 0 ? "" : "border-top-1px padding-top-2 tablet:padding-top-05"
          }  border-base-lightest padding-bottom-2 tablet:padding-bottom-05`}
        >
          <ChecklistTag status={item.status} />
          <span className="tablet:margin-left-2 text-left width-full">{item.title}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="minh-38">
      <div className="bg-base-extra-light margin-x-neg-4 margin-top-neg-4 radius-top-lg">
        <div className="padding-top-4 padding-bottom-4 margin-x-4">
          <h1>{props.anytimeActionLicenseRenewal.name}</h1>
          <div>
            <span className="text-bold">
              {Config.anytimeActionRenewalsDefaults.licenseExpirationHeaderText}
            </span>{" "}
            {licenseDetails?.expirationDateISO &&
              parseDateWithFormat(licenseDetails.expirationDateISO, defaultDateFormat).format(
                licenseSearchDateFormat
              )}
          </div>
        </div>
      </div>

      <div className="margin-top-3">
        <Content>{Config.anytimeActionRenewalsDefaults.LicenseDefaultText}</Content>
      </div>
      <HorizontalLine />

      <div className="margin-top-3">
        <Content>{props.anytimeActionLicenseRenewal.summaryDescriptionMd}</Content>
      </div>
      <HorizontalLine />

      <div className="h3-styling">{Config.anytimeActionRenewalsDefaults.licenseStatusHeaderText}</div>

      <div className="drop-shadow-xs padding-3 radius-lg">
        {licenseDetails?.licenseStatus && (
          <LicenseStatusHeader licenseStatus={licenseDetails.licenseStatus} />
        )}
        <HorizontalLine />
        <Accordion onChange={() => {}}>
          <AccordionSummary
            aria-controls=""
            expandIcon={<Icon className={"usa-icon--size-3 text-base-light"}>expand_more</Icon>}
            className={"h4-styling"}
          >
            {Config.licenseSearchTask.applicationChecklistItemsText}
          </AccordionSummary>
          <AccordionDetails>{licenseDetails?.checklistItems.map(receiptItem)}</AccordionDetails>
        </Accordion>
        <hr className="margin-0-override" />
        <div className="flex flex-column tablet-flex-row tablet-flex-alignItems-end padding-top-2">
          <div data-testid={`license-name-${licenseDetails?.nameAndAddress.name.toUpperCase()}`}>
            <div className="text-bold">{licenseDetails?.nameAndAddress.name.toUpperCase()}</div>
            {getOneLineAddress()}
          </div>
        </div>
      </div>

      <div>
        <div className="flex padding-2 flex-justify-end">
          <div className="padding-right-05 h6-styling text-italic text-base">
            {Config.anytimeActionRenewalsDefaults.licenseLastUpdatedText}
          </div>
          <div className="h6-styling text-italic text-base">
            {licenseDetails?.lastUpdatedISO &&
              parseDateWithFormat(licenseDetails.lastUpdatedISO, defaultDateFormat).format(
                licenseSearchDateFormat
              )}
          </div>
        </div>
      </div>
      <HorizontalLine />

      <Content>{props.anytimeActionLicenseRenewal.contentMd}</Content>
      {props.anytimeActionLicenseRenewal.form && (
        <>
          <HorizontalLine />
          <span className="h5-styling" data-testid="form-id-header">
            {Config.filingDefaults.formText} &nbsp;
          </span>
          <span className="h6-styling">{props.anytimeActionLicenseRenewal.form}</span>
        </>
      )}
      {props.anytimeActionLicenseRenewal.callToActionLink &&
        props.anytimeActionLicenseRenewal.callToActionText && (
          <SingleCtaLink
            link={props.anytimeActionLicenseRenewal.callToActionLink}
            text={props.anytimeActionLicenseRenewal.callToActionText}
          />
        )}
    </div>
  );
};
