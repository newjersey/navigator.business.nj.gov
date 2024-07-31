import { Content } from "@/components/Content";
import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { sortFilterCalendarEventsWithinAYear } from "@/lib/domain-logic/filterCalendarEvents";
import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { OperateReference } from "@/lib/types/types";
import { groupBy } from "@/lib/utils/helpers";
import { LicenseCalendarEvent, TaxFilingCalendarEvent } from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useEffect, useState } from "react";

const LIST_VIEW_MORE_INCREMENT = 5;

interface Props {
  business: Business;
  activeYear: string;
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendarAsList = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [numberOfVisibleCalendarEntries, setNumberOfVisibleCalendarEntries] =
    useState<number>(LIST_VIEW_MORE_INCREMENT);

  useEffect(() => {
    setNumberOfVisibleCalendarEntries(LIST_VIEW_MORE_INCREMENT);
  }, [props.activeYear]);

  const licenseCalendarEvents = getLicenseCalendarEvents(
    props.business?.licenseData,
    Number.parseInt(props.activeYear)
  );

  const sortedFilteredEventsWithinAYear: Array<TaxFilingCalendarEvent | LicenseCalendarEvent> = props.business
    ?.taxFilingData.filings
    ? sortFilterCalendarEventsWithinAYear(
        [...licenseCalendarEvents, ...props.business.taxFilingData.filings],
        props.activeYear
      )
    : [];

  if (sortedFilteredEventsWithinAYear.length === 0) {
    return (
      <>
        <Content className="text-base margin-bottom-3">
          {Config.dashboardDefaults.calendarEmptyDescriptionMarkdown}
        </Content>
        <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col usa-prose padding-x-3">
          <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />
        </div>
      </>
    );
  }

  const eventsGroupedByDate = groupBy(
    sortedFilteredEventsWithinAYear.filter((event) => {
      if (event.calendarEventType === "TAX-FILING") {
        return props.operateReferences[event.identifier];
      }
      return true;
    }),
    (value) => value.dueDate
  );

  const visibleEvents = eventsGroupedByDate.slice(0, numberOfVisibleCalendarEntries);

  return (
    <div data-testid="filings-calendar-as-list">
      {visibleEvents.map((events) => {
        return (
          <div
            className="flex margin-bottom-2 minh-6"
            key={events[0].dueDate}
            data-testid="calendar-list-entry"
          >
            <div className="width-05 bg-primary minw-05" />
            <div className="margin-left-205">
              <div className="text-bold">
                {parseDateWithFormat(events[0].dueDate, defaultDateFormat).format("MMMM D, YYYY")}
              </div>
              {events.map((event, index) => {
                if (event.calendarEventType === "TAX-FILING") {
                  return (
                    <CalendarEventItem
                      key={event.identifier}
                      title={props.operateReferences[event.identifier].name}
                      dueDate={event.dueDate}
                      urlSlug={`filings/${props.operateReferences[event.identifier].urlSlug}`}
                      index={index}
                    />
                  );
                } else if (event.calendarEventType === "LICENSE") {
                  return (
                    <LicenseEvent
                      key={`${event.licenseEventSubtype}-${event.dueDate}`}
                      licenseEvent={event}
                      index={index}
                      industryId={props.business.profileData.industryId}
                    />
                  );
                }
              })}
            </div>
          </div>
        );
      })}

      {eventsGroupedByDate.length > numberOfVisibleCalendarEntries && (
        <UnStyledButton
          isUnderline
          onClick={(): void => {
            setNumberOfVisibleCalendarEntries((previous) => previous + LIST_VIEW_MORE_INCREMENT);
          }}
        >
          {Config.dashboardDefaults.calendarListViewMoreButton}
        </UnStyledButton>
      )}
      <hr />
    </div>
  );
};
