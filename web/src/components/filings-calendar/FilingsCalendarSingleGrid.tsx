import { Tag } from "@/components/njwds-extended/Tag";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  isCalendarMonthLessThanCurrentMonth,
  sortFilterCalendarEventsWithinAYear,
} from "@/lib/domain-logic/filterCalendarEvents";
import { getLicenseCalendarEvent } from "@/lib/domain-logic/getLicenseCalendarEvent";
import { LicenseCalendarEvent, LicenseEventType, OperateReference } from "@/lib/types/types";
import {
  defaultDateFormat,
  getCurrentDate,
  getJanOfYear,
  parseDateWithFormat,
  TaxFiling,
  UserData,
} from "@businessnjgovnavigator/shared";
import Link from "next/link";
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
  const sortedFilteredFilingsWithinAYear: TaxFiling[] = props.userData?.taxFilingData.filings
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

  const licenseEvent = getLicenseCalendarEvent(
    props.userData?.licenseData,
    date.year(),
    props.userData.profileData.industryId,
    date.month()
  );

  if (licenseEvent && visibleFilings.length === NUM_OF_FILINGS_ALWAYS_VIEWABLE) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    remainingFilings.unshift(visibleFilings.pop()!);
  }

  const renderLicense = (licenseEvent: LicenseCalendarEvent | undefined): ReactNode => {
    const titles: Record<LicenseEventType, string> = {
      expiration: Config.licenseEventDefaults.expirationTitleLabel,
      renewal: Config.licenseEventDefaults.renewalTitleLabel,
    };
    return (
      licenseEvent && (
        <div className="line-height-1 margin-bottom-1" data-testid={`license-${licenseEvent.type}`}>
          <Tag backgroundColor="accent-warm-extra-light" isHover isRadiusMd isWrappingText>
            <Link href={`licenses/${licenseEvent.licenseType}-${licenseEvent.type}`}>
              <a
                href={`licenses/${licenseEvent.licenseType}-${licenseEvent.type}`}
                data-testid={licenseEvent.licenseType.toLowerCase()}
                className="usa-link text-secondary-darker hover:text-secondary-darker text-no-underline"
              >
                <span className="text-bold text-uppercase text-base-dark">
                  {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
                  {parseDateWithFormat(licenseEvent.dueDate, defaultDateFormat).format("M/D")}
                </span>{" "}
                <span className="text-no-uppercase text-underline text-base-dark">
                  {licenseEvent.licenseType} {titles[licenseEvent.type]}
                </span>
              </a>
            </Link>
          </Tag>
        </div>
      )
    );
  };

  const renderFilings = (filings: TaxFiling[]): ReactNode => {
    return filings
      .filter((filing) => {
        return props.operateReferences[filing.identifier];
      })
      .map((filing) => {
        return (
          <div key={filing.identifier} className="line-height-1 margin-bottom-1" data-testid="filing">
            <Tag backgroundColor="accent-warm-extra-light" isHover isRadiusMd isWrappingText>
              <Link href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}>
                <a
                  href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}
                  data-testid={filing.identifier.toLowerCase()}
                  className="usa-link text-secondary-darker hover:text-secondary-darker text-no-underline"
                >
                  <span className="text-bold text-uppercase text-base-dark">
                    {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
                    {parseDateWithFormat(filing.dueDate, defaultDateFormat).format("M/D")}
                  </span>{" "}
                  <span className="text-no-uppercase text-underline text-base-dark">
                    {props.operateReferences[filing.identifier].name}
                  </span>
                </a>
              </Link>
            </Tag>
          </div>
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
          {renderLicense(licenseEvent[0])}
          {remainingFilings.length > 0 && showExpandFilingsButton && (
            <>
              {renderFilings(remainingFilings)}
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
          {remainingFilings.length > 0 && !showExpandFilingsButton && (
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
