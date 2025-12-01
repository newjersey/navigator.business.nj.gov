import { Content } from "@/components/Content";
import { CalendarEventItem } from "@/components/filings-calendar/CalendarEventItem";
import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { sortFilterCalendarEventsWithinAYear } from "@/lib/domain-logic/filterCalendarEvents";
import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { getXrayRenewalEvent } from "@/lib/domain-logic/getXrayRenewalEvent";
import { groupBy } from "@/lib/utils/helpers";
import {
  LicenseCalendarEvent,
  TaxFilingCalendarEvent,
  XrayRegistrationCalendarEvent,
} from "@businessnjgovnavigator/shared";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/dateHelpers";
import { defaultDateFormat } from "@businessnjgovnavigator/shared/defaultConstants";
import {
  LicenseEventType,
  OperateReference,
  XrayRenewalCalendarEventType,
} from "@businessnjgovnavigator/shared/types";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useEffect, useState } from "react";

const LIST_VIEW_MORE_INCREMENT = 5;

interface Props {
  business: Business;
  activeYear: string;
  operateReferences: Record<string, OperateReference>;
  licenseEvents: LicenseEventType[];
  xrayRenewalEvent: XrayRenewalCalendarEventType;
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
    Number.parseInt(props.activeYear),
  );

  const taxFilings = props.business.taxFilingData.filings ?? [];

  const xrayRenewalCalendarEvent = getXrayRenewalEvent(
    props.business?.xrayRegistrationData,
    Number.parseInt(props.activeYear),
  );

  const calendarEvents: (
    | LicenseCalendarEvent
    | TaxFilingCalendarEvent
    | XrayRegistrationCalendarEvent
  )[] = xrayRenewalCalendarEvent
    ? [...taxFilings, ...licenseCalendarEvents, xrayRenewalCalendarEvent]
    : [...taxFilings, ...licenseCalendarEvents];

  const sortedFilteredEventsWithinAYear: Array<
    TaxFilingCalendarEvent | LicenseCalendarEvent | XrayRegistrationCalendarEvent
  > = sortFilterCalendarEventsWithinAYear([...calendarEvents], props.activeYear);

  const eventsGroupedByDate = groupBy(
    sortedFilteredEventsWithinAYear.filter((event) => {
      if (event.calendarEventType === "TAX-FILING") {
        return props.operateReferences[event.identifier];
      }
      return true;
    }),
    (value) => value.dueDate,
  );

  const visibleEvents = eventsGroupedByDate.slice(0, numberOfVisibleCalendarEntries);

  if (sortedFilteredEventsWithinAYear.length === 0) {
    return (
      <>
        <Content className="text-base margin-bottom-3">
          {Config.dashboardDefaults.calendarEmptyDescriptionMarkdown}
        </Content>
        <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col usa-prose padding-x-3">
          <img
            className="padding-y-2"
            src={`/img/empty-trophy-illustration.png`}
            alt="empty calendar"
          />
        </div>
      </>
    );
  }
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
                }
                if (event.calendarEventType === "LICENSE") {
                  return (
                    <LicenseEvent
                      key={event.licenseName + event.licenseEventSubtype}
                      LicenseCalendarEvent={event}
                      licenseEvents={props.licenseEvents}
                      index={index}
                    />
                  );
                }
                if (event.calendarEventType === "XRAY") {
                  return (
                    <CalendarEventItem
                      key={"XRAY_RENEWAL"}
                      title={props.xrayRenewalEvent.eventDisplayName}
                      dueDate={event.dueDate}
                      urlSlug={props.xrayRenewalEvent.urlSlug}
                      index={index}
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
