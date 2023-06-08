import { CalendarEvent } from "@/components/filings-calendar/CalendarEvent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LicenseCalendarEvent, LicenseEventType } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import Link from "next/link";
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

  const onClick = (): void => {
    analytics.event.calendar_date.click.go_to_date_detail_screen();
  };

  if (props.index !== undefined) {
    return (
      <div className={`margin-bottom-05 ${props.index === 0 ? "margin-top-05" : ""}`}>
        <Link href={urlSlug} passHref>
          <a href={urlSlug} onClick={onClick}>
            {displayTitle}
          </a>
        </Link>
      </div>
    );
  }

  return <CalendarEvent title={displayTitle} dueDate={props.licenseEvent.dueDate} urlSlug={urlSlug} />;
};
