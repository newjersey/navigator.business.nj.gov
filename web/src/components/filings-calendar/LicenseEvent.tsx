import { Tag } from "@/components/njwds-extended/Tag";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { LicenseCalendarEvent, LicenseEventType } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
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

  if (props.index !== undefined) {
    return (
      <div className={`margin-bottom-05 ${props.index === 0 ? "margin-top-05" : ""}`}>
        <Link href={`licenses/${props.industryId}-${props.licenseEvent.type}`} passHref>
          <a
            href={`licenses/${props.industryId}-${props.licenseEvent.type}`}
            onClick={(): void => {
              analytics.event.calendar_date.click.go_to_date_detail_screen();
            }}
          >
            {LookupIndustryById(props.industryId).name} {titles[props.licenseEvent.type]}
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="line-height-1 margin-bottom-1" data-testid={`license-${props.licenseEvent.type}`}>
      <Tag backgroundColor="accent-warm-extra-light" isHover isRadiusMd isWrappingText>
        <Link href={urlSlug}>
          <a
            href={urlSlug}
            data-testid={props.industryId}
            className="usa-link text-secondary-darker hover:text-secondary-darker text-no-underline"
          >
            <span className="text-bold text-uppercase text-base-dark">
              {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
              {parseDateWithFormat(props.licenseEvent.dueDate, defaultDateFormat).format("M/D")}
            </span>{" "}
            <span className="text-no-uppercase text-underline text-base-dark">
              {LookupIndustryById(props.industryId).name} {titles[props.licenseEvent.type]}
            </span>
          </a>
        </Link>
      </Tag>
    </div>
  );
};
