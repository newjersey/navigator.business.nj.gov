import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LicenseEventType } from "@/lib/types/types";
import { LicenseCalendarEvent, LicenseEventSubtype } from "@businessnjgovnavigator/shared/taxFiling";
import { ReactElement } from "react";

interface Props {
  LicenseCalendarEvent: LicenseCalendarEvent;
  licenseEvents: LicenseEventType[];
  index?: number;
}

export const LicenseEvent = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const titles: Record<LicenseEventSubtype, string> = {
    expiration: Config.licenseEventDefaults.expirationTitleLabel,
    renewal: Config.licenseEventDefaults.renewalTitleLabel,
  };

  const licenseEvent = props.licenseEvents.find((event) => {
    return event.licenseName === props.LicenseCalendarEvent.licenseName;
  });

  if (!licenseEvent) {
    return null;
  }

  const urlSlug = `licenses/${licenseEvent.urlSlug}-${props.LicenseCalendarEvent.licenseEventSubtype}`;
  const displayTitle = `${licenseEvent.calendarEventDisplayName} ${
    titles[props.LicenseCalendarEvent.licenseEventSubtype]
  }`;

  return (
    <CalendarEventItem
      title={displayTitle}
      dueDate={props.LicenseCalendarEvent.dueDate}
      urlSlug={urlSlug}
      index={props.index}
    />
  );
};
