import { CalendarEvent } from "@/components/filings-calendar/CalendarEvent";
import { LicenseEvent } from "@/components/filings-calendar/LicenseEvent";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  isCalendarMonthLessThanCurrentMonth,
  sortFilterCalendarEventsWithinAYear,
} from "@/lib/domain-logic/filterCalendarEvents";
import { getLicenseCalendarEvents } from "@/lib/domain-logic/getLicenseCalendarEvents";
import { OperateReference } from "@/lib/types/types";
import {
  defaultDateFormat,
  getCurrentDate,
  getJanOfYear,
  LicenseCalendarEvent,
  parseDateWithFormat,
  TaxFilingCalendarEvent,
  UserData,
} from "@businessnjgovnavigator/shared";
import { ReactElement, ReactNode, useState } from "react";
import { UnStyledButton } from "../njwds-extended/UnStyledButton";

interface Props {
  userData: UserData;
  num: number;
  activeYear: string;
  operateReferences: Record<string, OperateReference>;
}

const NUM_OF_FILINGS_ALWAYS_VIEWABLE = 2;

export const FilingsCalendarSingleGrid = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const [showExpandFilingsButton, setShowExpandFilingsButton] = useState(false);
  const date = getJanOfYear(parseDateWithFormat(props.activeYear, "YYYY")).add(props.num, "months");
  const sortedFilteredFilingsWithinAYear: TaxFilingCalendarEvent[] = props.userData?.taxFilingData.filings
    ? sortFilterCalendarEventsWithinAYear(props.userData.taxFilingData.filings, props.activeYear)
    : [];

  const thisMonthFilings = sortedFilteredFilingsWithinAYear.filter((it) => {
    return (
      parseDateWithFormat(it.dueDate, defaultDateFormat).month() === date.month() &&
      parseDateWithFormat(it.dueDate, defaultDateFormat).year() === date.year()
    );
  });

  const visibleFilings = thisMonthFilings.slice(0, NUM_OF_FILINGS_ALWAYS_VIEWABLE);
  const remainingFilings = thisMonthFilings.slice(NUM_OF_FILINGS_ALWAYS_VIEWABLE);
  const isOnCurrentYear = getCurrentDate().year().toString() === props.activeYear;

  const licenseEvents = getLicenseCalendarEvents(props.userData?.licenseData, date.year(), date.month());
  let visibleLicenses: LicenseCalendarEvent[] = [];
  let remainingLicenses: LicenseCalendarEvent[] = [];
  if (visibleFilings.length < NUM_OF_FILINGS_ALWAYS_VIEWABLE) {
    const visibleSlotsLeft = NUM_OF_FILINGS_ALWAYS_VIEWABLE - visibleFilings.length;
    visibleLicenses = licenseEvents.slice(0, visibleSlotsLeft);
    remainingLicenses = visibleLicenses.slice(visibleSlotsLeft);
  } else {
    remainingLicenses = licenseEvents;
  }

  const remainingEventsCount = remainingLicenses.length + remainingFilings.length;

  const renderFilings = (filings: TaxFilingCalendarEvent[]): ReactNode => {
    return filings
      .filter((filing) => {
        return props.operateReferences[filing.identifier];
      })
      .map((filing) => {
        return (
          <CalendarEvent
            key={filing.identifier}
            title={props.operateReferences[filing.identifier].name}
            dueDate={filing.dueDate}
            urlSlug={`filings/${props.operateReferences[filing.identifier].urlSlug}`}
          />
        );
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
          {renderFilings(visibleFilings)}
          {visibleLicenses.map((licenseEvent) => (
            <LicenseEvent
              key={licenseEvent.licenseEventSubtype}
              licenseEvent={licenseEvent}
              industryId={props.userData.profileData.industryId}
            />
          ))}
          {remainingEventsCount > 0 && showExpandFilingsButton && (
            <>
              {renderFilings(remainingFilings)}
              {remainingLicenses.map((licenseEvent) => (
                <LicenseEvent
                  key={licenseEvent.licenseEventSubtype}
                  licenseEvent={licenseEvent}
                  industryId={props.userData.profileData.industryId}
                />
              ))}
              <div className="flex flex-justify-center">
                <UnStyledButton
                  style="tertiary"
                  underline
                  onClick={(): void => setShowExpandFilingsButton(!showExpandFilingsButton)}
                >
                  {Config.dashboardDefaults.viewLessFilingsButton}
                </UnStyledButton>
              </div>
            </>
          )}
          {remainingEventsCount > 0 && !showExpandFilingsButton && (
            <div className="flex flex-justify-center">
              <UnStyledButton
                style="tertiary"
                underline
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
