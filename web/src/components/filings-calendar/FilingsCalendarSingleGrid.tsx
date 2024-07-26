import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  isCalendarMonthLessThanCurrentMonth,
  sortCalendarEventsEarliestToLatest,
  sortFilterCalendarEventsWithinAYear,
} from "@/lib/domain-logic/filterCalendarEvents";
import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { LicenseEventType, OperateReference } from "@/lib/types/types";
import {
  Business,
  LicenseCalendarEvent,
  TaxFilingCalendarEvent,
  defaultDateFormat,
  getCurrentDate,
  getJanOfYear,
  parseDateWithFormat,
} from "@businessnjgovnavigator/shared";
import { ReactElement, ReactNode, useState } from "react";
import { UnStyledButton } from "../njwds-extended/UnStyledButton";

interface Props {
  business: Business;
  num: number;
  activeYear: string;
  operateReferences: Record<string, OperateReference>;
  licenseEvents: LicenseEventType[];
}

const NUM_OF_FILINGS_ALWAYS_VIEWABLE = 2;

export const FilingsCalendarSingleGrid = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [showExpandFilingsButton, setShowExpandFilingsButton] = useState(false);
  const date = getJanOfYear(parseDateWithFormat(props.activeYear, "YYYY")).add(props.num, "months");
  const sortedFilteredFilingsWithinAYear: TaxFilingCalendarEvent[] = props.business?.taxFilingData.filings
    ? sortFilterCalendarEventsWithinAYear(props.business.taxFilingData.filings, props.activeYear)
    : [];

  const thisMonthFilings = sortedFilteredFilingsWithinAYear.filter((it) => {
    return (
      parseDateWithFormat(it.dueDate, defaultDateFormat).month() === date.month() &&
      parseDateWithFormat(it.dueDate, defaultDateFormat).year() === date.year()
    );
  });

  const isOnCurrentYear = getCurrentDate().year().toString() === props.activeYear;

  const thisMonthLicenseEvents = getLicenseCalendarEvents(
    props.business?.licenseData,
    date.year(),
    date.month()
  );
  const sortedCalendarEvents = sortCalendarEventsEarliestToLatest([
    ...thisMonthFilings,
    ...thisMonthLicenseEvents,
  ]);
  const visibleEvents = sortedCalendarEvents.slice(0, NUM_OF_FILINGS_ALWAYS_VIEWABLE);
  const remainingEvents = sortedCalendarEvents.slice(NUM_OF_FILINGS_ALWAYS_VIEWABLE);

  const renderCalendarEventItems = (events: (TaxFilingCalendarEvent | LicenseCalendarEvent)[]): ReactNode => {
    return events.map((event) => {
      if (event.calendarEventType === "TAX-FILING" && !props.operateReferences[event.identifier]) return null;

      if (event.calendarEventType === "TAX-FILING") {
        return (
          <CalendarEventItem
            key={event.identifier}
            title={props.operateReferences[event.identifier].name}
            dueDate={event.dueDate}
            urlSlug={`filings/${props.operateReferences[event.identifier].urlSlug}`}
          />
        );
      }

      if (event.calendarEventType === "LICENSE") {
        return (
          <LicenseEvent
            key={event.licenseName + event.licenseEventSubtype}
            LicenseCalendarEvent={event}
            licenseEvents={props.licenseEvents}
          />
        );
      }
    });
  };

  return (
    <div data-testid={date.format("MMM YYYY")}>
      <div
        className={`${
          isOnCurrentYear && getCurrentDate().month() === date.month() ? "text-green" : "text-base-dark"
        } padding-bottom-1`}
        aria-hidden="true"
      >
        <span className="text-bold">{date.format("MMM")}</span> <span>{date.format("YYYY")}</span>
      </div>

      {isCalendarMonthLessThanCurrentMonth(props.num) && isOnCurrentYear ? (
        <></>
      ) : (
        <>
          {renderCalendarEventItems(visibleEvents)}
          {remainingEvents.length > 0 && showExpandFilingsButton && (
            <>
              {renderCalendarEventItems(remainingEvents)}
              <div className="flex flex-justify-center">
                <UnStyledButton
                  isUnderline
                  onClick={(): void => setShowExpandFilingsButton(!showExpandFilingsButton)}
                >
                  {Config.dashboardDefaults.viewLessFilingsButton}
                </UnStyledButton>
              </div>
            </>
          )}
          {remainingEvents.length > 0 && !showExpandFilingsButton && (
            <div className="flex flex-justify-center">
              <UnStyledButton
                isUnderline
                onClick={(): void => setShowExpandFilingsButton(!showExpandFilingsButton)}
              >
                {Config.dashboardDefaults.viewMoreFilingsButton}
              </UnStyledButton>
            </div>
          )}
        </>
      )}
    </div>
  );
};
