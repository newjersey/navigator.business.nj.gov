import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
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

  const licenseName = LookupIndustryById(props.industryId).licenseType;

  if (!props.licenseEvent || !props.industryId || !licenseName) {
    return null;
  }

  const urlSlug = `licenses/${props.industryId}-${props.licenseEvent.licenseEventSubtype}`;
  const displayTitle = `${licenseName} ${titles[props.licenseEvent.licenseEventSubtype]}`;

  return (
    <CalendarEventItem
      title={displayTitle}
      dueDate={props.licenseEvent.dueDate}
      urlSlug={urlSlug}
      index={props.index}
    />
  );
};
