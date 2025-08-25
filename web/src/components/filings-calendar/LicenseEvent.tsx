import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { LicenseCalendarEvent } from "@businessnjgovnavigator/shared/";
import { LicenseEventType } from "@businessnjgovnavigator/shared/types";
import { ReactElement } from "react";

interface Props {
  LicenseCalendarEvent: LicenseCalendarEvent;
  licenseEvents: LicenseEventType[];
  index?: number;
}

export const LicenseEvent = (props: Props): ReactElement | null => {
  const licenseEvent = props.licenseEvents.find((event) => {
    return event.licenseName === props.LicenseCalendarEvent.licenseName;
  });

  if (!licenseEvent) {
    return null;
  }

  const urlSlug = `license-calendar-event/${licenseEvent.urlSlug}-${props.LicenseCalendarEvent.licenseEventSubtype}`;
  const displayTitle =
    props.LicenseCalendarEvent.licenseEventSubtype === "renewal"
      ? licenseEvent.renewalEventDisplayName
      : licenseEvent.expirationEventDisplayName;

  return (
    <>
      <CalendarEventItem
        title={displayTitle}
        dueDate={props.LicenseCalendarEvent.dueDate}
        urlSlug={urlSlug}
        index={props.index}
      />
    </>
  );
};
