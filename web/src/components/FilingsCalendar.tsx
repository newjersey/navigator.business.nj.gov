import { ArrowTooltip } from "@/components/ArrowTooltip";
import {
  FilingsCalendarTaxAccess,
  shouldRenderFilingsCalendarTaxAccess,
} from "@/components/FilingsCalendarTaxAccess";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortFilterFilingsWithinAYear } from "@/lib/domain-logic/filterFilings";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getCurrentDate, parseDateWithFormat, TaxFiling } from "@businessnjgovnavigator/shared";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/index";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import router from "next/router";
import { ReactElement } from "react";
import { Content } from "./Content";
import { Button } from "./njwds-extended/Button";

interface Props {
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const Config = getMergedConfig();
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const sortedFilteredFilingsWithinAYear: TaxFiling[] = userData?.taxFilingData.filings
    ? sortFilterFilingsWithinAYear(userData.taxFilingData.filings)
    : [];

  const editOnClick = () => {
    analytics.event.roadmap_profile_edit_button.click.go_to_profile_screen();
    router.push(ROUTES.profile);
  };

  const getMonth = (num: number): ReactElement => {
    const date = getCurrentDate().add(num, "months");
    let textColor = "text-base-dark";
    if (getCurrentDate().month() === date.month()) {
      textColor = "text-green";
    }

    const thisMonthFilings = sortedFilteredFilingsWithinAYear.filter((it) => {
      return (
        parseDateWithFormat(it.dueDate, "YYYY-MM-DD").month() === date.month() &&
        parseDateWithFormat(it.dueDate, "YYYY-MM-DD").year() === date.year()
      );
    });

    return (
      <div data-testid={date.format("MMM YYYY")}>
        <div className={`${textColor} padding-bottom-1`}>
          <span className="text-bold">{date.format("MMM")}</span> <span>{date.format("YYYY")}</span>
        </div>
        <div>
          {thisMonthFilings
            .filter((filing) => props.operateReferences[filing.identifier])
            .map((filing) => (
              <div key={filing.identifier} className="line-height-1 margin-bottom-1" data-testid="filing">
                <Link href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}>
                  <a
                    href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}
                    data-testid={filing.identifier.toLowerCase()}
                    className="usa-link text-secondary-darker text-secondary-darker:hover text-no-underline"
                  >
                    <Tag backgroundColor="warning-light" isHover isRadiusMd isWrappingText>
                      <span className="text-bold text-uppercase">
                        {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
                        {parseDateWithFormat(filing.dueDate, "YYYY-MM-DD").format("M/D")}
                      </span>
                      {" - "}
                      <span className="text-no-uppercase text-underline">
                        {props.operateReferences[filing.identifier].name}
                      </span>
                    </Tag>
                  </a>
                </Link>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderCalendarAsGrid = (): ReactElement => {
    const monthIndices = [...Array(12).keys()];

    const monthsPerRow = 4;

    const rowIndices = monthIndices.filter((num) => num % monthsPerRow === 0);

    return (
      <table data-testid="filings-calendar-as-table">
        <tbody>
          {rowIndices.map((rowIndex) => {
            const monthIndicesForRow = monthIndices.slice(rowIndex, rowIndex + monthsPerRow);
            return (
              <tr key={rowIndex}>
                {monthIndicesForRow.map((month) => (
                  <td key={month} className="td-gray-border">
                    {getMonth(month)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderCalendarAsList = (): ReactElement => {
    if (sortedFilteredFilingsWithinAYear.length === 0) return <></>;

    return (
      <div data-testid="filings-calendar-as-list">
        {sortedFilteredFilingsWithinAYear
          .filter((filing) => props.operateReferences[filing.identifier])
          .map((filing) => (
            <div className="flex margin-bottom-2 minh-6" key={`${filing.identifier}-${filing.dueDate}`}>
              <div className="width-05 bg-primary minw-05" />
              <div className="margin-left-205">
                <div className="text-bold">
                  {parseDateWithFormat(filing.dueDate, "YYYY-MM-DD").format("MMMM D, YYYY")}
                </div>
                <div>
                  <Link href={`filings/${props.operateReferences[filing.identifier].urlSlug}`} passHref>
                    <a
                      href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}
                      onClick={() => {
                        analytics.event.calendar_date.click.go_to_date_detail_screen();
                      }}
                    >
                      {props.operateReferences[filing.identifier].name}{" "}
                      {parseDateWithFormat(filing.dueDate, "YYYY-MM-DD").format("YYYY")}
                    </a>
                  </Link>
                </div>
              </div>
            </div>
          ))}{" "}
        <hr />
      </div>
    );
  };

  const renderCalendar = (): ReactElement => {
    const type = LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarType;
    if (type === "LIST") return renderCalendarAsList();
    if (type === "FULL") {
      if (isLargeScreen && userData?.preferences.isCalendarFullView) return renderCalendarAsGrid();
      return renderCalendarAsList();
    }
    return <></>;
  };

  const renderToggleButton = (): ReactElement => {
    if (!userData) return <></>;

    return userData.preferences.isCalendarFullView ? (
      <Button
        style="light"
        noRightMargin
        className="font-body-2xs padding-y-05 padding-x-1"
        onClick={handleCalendarOnClick}
      >
        <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
        {Config.dashboardDefaults.calendarListViewButton}
      </Button>
    ) : isLargeScreen ? (
      <Button
        style="light"
        noRightMargin
        className="font-body-2xs padding-y-05 padding-x-1"
        onClick={handleCalendarOnClick}
      >
        <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
        {Config.dashboardDefaults.calendarGridViewButton}
      </Button>
    ) : (
      <></>
    );
  };

  const handleCalendarOnClick = () => {
    if (!userData) return;
    update({
      ...userData,
      preferences: {
        ...userData.preferences,
        isCalendarFullView: !userData.preferences.isCalendarFullView,
      },
    });
  };

  return (
    <div className="calendar-container">
      <div className="flex flex-align-end flex-justify" data-testid="filings-calendar">
        <div className="flex flex-align-end">
          <h2 className="margin-bottom-0">{Config.dashboardDefaults.calendarHeader}</h2>
          <div className="margin-top-05">
            <ArrowTooltip title={Config.dashboardDefaults.calendarTooltip}>
              <div
                className="fdr fac margin-left-1 margin-bottom-05 font-body-lg text-green"
                data-testid="calendar-tooltip"
              >
                <Icon>help_outline</Icon>
              </div>
            </ArrowTooltip>
          </div>
        </div>
        {sortedFilteredFilingsWithinAYear.length > 0 ? renderToggleButton() : <></>}
      </div>
      <hr className="bg-base-lighter margin-top-2 margin-bottom-4" aria-hidden={true} />
      {shouldRenderFilingsCalendarTaxAccess(userData) && <FilingsCalendarTaxAccess />}
      {sortedFilteredFilingsWithinAYear.length > 0 ? (
        <>
          {renderCalendar()}
          <div className="margin-top-2">
            <p className="text-base-dark h6-styling">{Config.dashboardDefaults.calendarLegalText}</p>
          </div>
        </>
      ) : (
        <div data-testid="empty-calendar" className="padding-y-0">
          <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col bg-base-lightest usa-prose padding-y-205 padding-x-3">
            <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
            <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />
            {userData?.taxFilingData && userData?.taxFilingData.filings.length === 0 && (
              <Content onClick={editOnClick}>{Config.dashboardDefaults.emptyCalendarBodyText}</Content>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
