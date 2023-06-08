import { CalendarEvent } from "@/components/filings-calendar/CalendarEvent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { LicenseCalendarEvent, LicenseEventSubtype } from "@businessnjgovnavigator/shared/taxFiling";
import { ReactElement } from "react";

interface Props {
  licenseEvent: LicenseCalendarEvent | undefined;
  industryId: string | undefined;
  index?: number;
}

export const LicenseEvent = (props: Props): ReactElement | null => {
  const { Config } = useConfig();

  const titles: Record<LicenseEventSubtype, string> = {
    expiration: Config.licenseEventDefaults.expirationTitleLabel,
    renewal: Config.licenseEventDefaults.renewalTitleLabel,
  };

  if (!props.licenseEvent || !props.industryId) {
    return null;
  }

  const urlSlug = `licenses/${props.industryId}-${props.licenseEvent.licenseEventSubtype}`;
  const displayTitle = `${LookupIndustryById(props.industryId).name} ${
    titles[props.licenseEvent.licenseEventSubtype]
  }`;

  return (
    <CalendarEvent
      title={displayTitle}
      dueDate={props.licenseEvent.dueDate}
      urlSlug={urlSlug}
      index={props.index}
    />
  );
};
