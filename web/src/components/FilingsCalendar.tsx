import { ArrowTooltip } from "@/components/ArrowTooltip";
import { FilingsCalendarTaxAccess } from "@/components/FilingsCalendarTaxAccess";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { getMergedConfig } from "@/contexts/configContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getCurrentDate, parseDateWithFormat } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import router from "next/router";
import { ReactElement } from "react";
import { Content } from "./Content";
import { FilingsCalendarAsList } from "./FilingsCalendarAsList";
import { Button } from "./njwds-extended/Button";

interface Props {
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const Config = getMergedConfig();
  const { userData, update } = useUserData();
  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);
  const taxFilings =
    userData?.taxFilingData.filings.sort((a, b) =>
      parseDateWithFormat(a.dueDate, "YYYY-MM-DD").isBefore(parseDateWithFormat(b.dueDate, "YYYY-MM-DD"))
        ? -1
        : 1
    ) || [];

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

    const thisMonthFilings = taxFilings.filter((it) => {
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
                    <Tag
                      textWrap={true}
                      tagVariant={filing.identifier === "ANNUAL_FILING" ? "info" : "accent"}
                      hover={true}
                    >
                      <span className="text-bold text-uppercase ">
                        {Config.dashboardDefaults.calendarFilingDueDateLabel}{" "}
                        {parseDateWithFormat(filing.dueDate, "YYYY-MM-DD").format("M/D")}
                      </span>
                      {" - "}
                      <span className="text-no-uppercase">
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

  const renderCalendar = (): ReactElement => {
    const monthIndices = [...Array(12).keys()];

    const monthsPerRow = 4;

    const rowIndices = monthIndices.filter((num) => num % monthsPerRow === 0);

    return (
      <div className="calendar-container">
        <div className="flex flex-align-end padding-top-2 flex-justify" data-testid="filings-calendar">
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
          <Button
            style="light"
            noRightMargin
            className="font-body-2xs padding-y-05 padding-x-1"
            onClick={handleCalendarOnClick}
          >
            <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
            {Config.dashboardDefaults.calendarListViewButton}
          </Button>
        </div>
        <hr className="bg-base-lighter margin-bottom-4" aria-hidden={true} />
        <FilingsCalendarTaxAccess />
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
        <p className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</p>
      </div>
    );
  };

  return taxFilings.length > 0 ? (
    <>
      {isLargeScreen && userData?.preferences.isCalendarFullView ? (
        renderCalendar()
      ) : (
        <FilingsCalendarAsList onToggle={handleCalendarOnClick} operateReferences={props.operateReferences} />
      )}
    </>
  ) : (
    <div data-testid="empty-calendar" className=" padding-y-2 ">
      <h2 className="margin-bottom-0">{Config.dashboardDefaults.calendarHeader}</h2>
      <hr className="bg-base-light margin-y-3 margin-right-105" aria-hidden={true} />
      <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col bg-base-lightest usa-prose padding-y-205 padding-x-3">
        <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
        <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />

        <Content onClick={editOnClick}>{Config.dashboardDefaults.emptyCalendarBodyText}</Content>
      </div>
    </div>
  );
  <></>;
};
