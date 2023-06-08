import { CalendarEvent } from "@/components/filings-calendar/CalendarEvent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LicenseCalendarEvent, LicenseEventType } from "@/lib/types/types";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { ReactElement } from "react";

interface Props {
  licenseEvent: LicenseCalendarEvent | undefined;
  industryId: string | undefined;
  index?: number;
}

export const LicenseEvent = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const titles: Record<LicenseEventType, string> = {
    expiration: Config.licenseEventDefaults.expirationTitleLabel,
    renewal: Config.licenseEventDefaults.renewalTitleLabel,
  };

  if (!props.licenseEvent || !props.industryId) {
    return null;
  }

  const urlSlug = `licenses/${props.industryId}-${props.licenseEvent.type}`;
  const displayTitle = `${LookupIndustryById(props.industryId).name} ${titles[props.licenseEvent.type]}`;

  return (
    <CalendarEvent
      title={displayTitle}
      dueDate={props.licenseEvent.dueDate}
      urlSlug={urlSlug}
      index={props.index}
    />
  );
};
