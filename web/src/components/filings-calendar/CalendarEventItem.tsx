import { Tag } from "@/components/njwds-extended/Tag";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  urlSlug: string;
  dueDate: string;
  title: string;
  index?: number;
}

export const CalendarEventItem = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const onClick = (): void => {
    analytics.event.calendar_date.click.go_to_date_detail_screen();
  };

  if (props.index !== undefined) {
    return (
      <div className={`margin-bottom-05 ${props.index === 0 ? "margin-top-05" : ""}`}>
        <Link href={props.urlSlug} passHref>
          <a href={props.urlSlug} onClick={onClick} data-testid="calendar-event-anchor">
            {props.title}
          </a>
        </Link>
      </div>
    );
  }

  return (
    <div className="line-height-1 margin-bottom-1">
      <Tag backgroundColor="accent-warm-extra-light" isHover isRadiusMd isWrappingText>
        <Link href={props.urlSlug}>
          <a
            data-testid="calendar-event-anchor"
            href={props.urlSlug}
            onClick={onClick}
            className="usa-link text-secondary-darker hover:text-secondary-darker text-no-underline"
          >
            <span className="text-bold text-uppercase text-base-dark">
              {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
              {parseDateWithFormat(props.dueDate, defaultDateFormat).format("M/D")}
            </span>{" "}
            <span className="text-no-uppercase text-underline text-base-dark">{props.title}</span>
          </a>
        </Link>
      </Tag>
    </div>
  );
};
