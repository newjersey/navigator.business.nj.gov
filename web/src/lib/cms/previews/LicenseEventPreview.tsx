import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { PreviewProps } from "@/lib/cms/helpers/previewHelpers";
import { usePageData } from "@/lib/cms/helpers/usePageData";
import { usePreviewRef } from "@/lib/cms/helpers/usePreviewRef";
import { LicenseEventType } from "@/lib/types/types";
import { LicenseElement } from "@/pages/licenses/[licenseUrlSlug]";
import { LicenseCalendarEvent } from "@businessnjgovnavigator/shared/taxFiling";
import { ReactElement } from "react";

const LicenseEventPreview = (props: PreviewProps): ReactElement => {
  const ref = usePreviewRef(props);
  const license = usePageData<LicenseEventType>(props);

  const LicenseCalendarEvent: LicenseCalendarEvent = {
    dueDate: license.previewType === "renewal" ? "2024-02-01" : "2024-01-01",
    calendarEventType: "LICENSE",
    licenseEventSubtype: license.previewType ?? "expiration",
    licenseName: license.licenseName,
  };

  return (
    <div className="cms" ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <div>This file is mapped to the following license (not enabled if blank):</div>
      <div className="margin-bottom-5 text-bold">{license.licenseName}</div>
      Preview of {license.previewType ?? "expiration"} calendar event
      <LicenseEvent LicenseCalendarEvent={LicenseCalendarEvent} licenseEvents={[license]} />
      <div className="margin-top-10" />
      <LicenseElement
        licenseName="IndustryName"
        license={license}
        licenseEventType={license.previewType ?? "expiration"}
        dueDate={license.previewType === "renewal" ? "2024-02-01" : "2024-01-01"}
      />
    </div>
  );
};

export default LicenseEventPreview;
