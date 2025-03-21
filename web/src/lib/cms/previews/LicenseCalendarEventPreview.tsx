import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { LicenseElement } from "@/components/tasks/license-calendar-event/LicenseCalendarEventElement";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { LicenseEventType } from "@/lib/types/types";
import { LicenseCalendarEvent } from "@businessnjgovnavigator/shared/";
import {
  generateBusiness,
  generateLicenseDetails,
  generateProfileData,
} from "@businessnjgovnavigator/shared/test";
import { ReactElement } from "react";

const LicenseCalendarEventPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const license = usePageData<LicenseEventType>(props);

  const licenseName = license.licenseName || "Health Care Services";
  const business = generateBusiness({
    profileData: generateProfileData({ legalStructureId: undefined }),
    licenseData: {
      lastUpdatedISO: "tbd",
      licenses: {
        [licenseName]: generateLicenseDetails({
          nameAndAddress: {
            name: "Business Sample",
            addressLine1: "1 Business Way",
            addressLine2: "Suite 10",
            zipCode: "08211",
          },
          licenseStatus: "EXPIRED",
          checklistItems: [],
          expirationDateISO: "2020-01-01T00:00:00.000Z",
        }),
      },
    },
  });

  const expirationLicenseCalendarEvent: LicenseCalendarEvent = {
    dueDate: "2024-01-01",
    calendarEventType: "LICENSE",
    licenseEventSubtype: "expiration",
    licenseName: license.licenseName,
  };

  const renewalLicenseCalendarEvent: LicenseCalendarEvent = {
    dueDate: "2024-01-01",
    calendarEventType: "LICENSE",
    licenseEventSubtype: "renewal",
    licenseName: license.licenseName,
  };

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>This file is mapped to the following license (not enabled if blank):</div>
      <div className="margin-bottom-5 text-bold">{license.licenseName}</div>
      Expiration event
      <LicenseEvent LicenseCalendarEvent={expirationLicenseCalendarEvent} licenseEvents={[license]} />
      Renewal event
      <LicenseEvent LicenseCalendarEvent={renewalLicenseCalendarEvent} licenseEvents={[license]} />
      <div className="margin-top-8" />
      The expiration event will be shown in this preview, all the content underneath the header is shared
      between both renewal and expiration events.
      <div className="margin-top-4" />
      <LicenseElement
        licenseName="IndustryName"
        license={license}
        licenseEventType="expiration"
        CMS_ONLY_fakeBusiness={business}
        CMS_ONLY_fakeLicenseName={licenseName}
      />
    </div>
  );
};

export default LicenseCalendarEventPreview;
