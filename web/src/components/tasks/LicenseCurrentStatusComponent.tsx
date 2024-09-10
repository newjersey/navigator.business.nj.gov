import { ChecklistTag } from "@/components/ChecklistTag";
import { HorizontalLine } from "@/components/HorizontalLine";
import { Heading } from "@/components/njwds-extended/Heading";
import { Icon } from "@/components/njwds/Icon";
import { LicenseStatusHeader } from "@/components/tasks/LicenseStatusHeader";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import {
  LicenseData,
  LicenseName,
  licenseSearchDateFormat,
  LicenseStatusItem,
} from "@businessnjgovnavigator/shared/license";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  licenseData?: LicenseData;
  licenseName: LicenseName;
}

export const LicenseCurrentStatusComponent = (props: Props): ReactElement => {
  const { Config } = useConfig();

  if (!props.licenseData) return <></>;
  const licenseDetails = props.licenseData?.licenses?.[props.licenseName];

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
    <div data-testid="license-current-status-component">
      <Heading level={2} styleVariant={"h3"}>
        {Config.anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults.licenseStatusHeaderText}
      </Heading>

      <div className="drop-shadow-xs padding-3 radius-lg">
        {licenseDetails?.licenseStatus && (
          <LicenseStatusHeader licenseStatus={licenseDetails.licenseStatus} />
        )}
        <HorizontalLine />
        <Accordion onChange={() => {}}>
          <AccordionSummary
            aria-controls=""
            expandIcon={<Icon className={"usa-icon--size-3 text-base-light"}>expand_more</Icon>}
          >
            <Heading level={3} styleVariant={"h4"}>
              {Config.licenseSearchTask.applicationChecklistItemsText}
            </Heading>
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
            {Config.anytimeActionReinstatementAndLicenseCalendarEventStatusDefaults.licenseLastUpdatedText}
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
    </div>
  );
};
