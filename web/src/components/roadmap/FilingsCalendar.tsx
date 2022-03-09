import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Tag } from "@/components/njwds-extended/Tag";
import { Icon } from "@/components/njwds/Icon";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import { getCurrentDate } from "@/lib/utils/getCurrentDate";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { TaxFiling } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import dayjs from "dayjs";
import Link from "next/link";
import React, { ReactElement } from "react";

interface Props {
  taxFilings: TaxFiling[];
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const getMonth = (num: number): ReactElement => {
    const date = getCurrentDate().add(num, "months");
    let textColor = "text-base-dark";
    if (getCurrentDate().month() === date.month()) {
      textColor = "text-green";
    }

    const thisMonthFilings = props.taxFilings
      .filter((it) => dayjs(it.dueDate, "YYYY-MM-DD").month() === date.month())
      .sort((a, b) => (dayjs(a.dueDate, "YYYY-MM-DD").isBefore(dayjs(b.dueDate, "YYYY-MM-DD")) ? -1 : 1));

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
                        {Config.roadmapDefaults.calendarFilingDueDateLabel}{" "}
                        {dayjs(filing.dueDate, "YYYY-MM-DD").format("M/D")}
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

  const renderCalendar = (): ReactElement => {
    const monthIndices = Array.from(Array(12).keys());

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
                  <td key={month}>{getMonth(month)}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const renderList = () => (
    <div data-testid="filings-calendar-as-list">
      {props.taxFilings
        .filter((filing) => props.operateReferences[filing.identifier])
        .map((filing) => (
          <div key={`${filing.identifier}-${filing.dueDate}`} className="flex margin-bottom-2 minh-6">
            <div className="width-05 bg-primary"></div>
            <div className="margin-left-205">
              <div className="text-bold">{dayjs(filing.dueDate, "YYYY-MM-DD").format("MMMM D, YYYY")}</div>
              <div>
                <Link href={`filings/${props.operateReferences[filing.identifier].urlSlug}`} passHref>
                  <a href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}>
                    {props.operateReferences[filing.identifier].name}{" "}
                    {dayjs(filing.dueDate, "YYYY-MM-DD").format("YYYY")}
                  </a>
                </Link>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  return (
    <>
      <div className="fdr padding-top-2">
        <h2 className="">{Config.dashboardDefaults.calendarHeader}</h2>
        <div className="margin-top-05">
          <ArrowTooltip title={Config.dashboardDefaults.calendarTooltip}>
            <div className="fdr fac margin-left-1 font-body-lg text-green" data-testid="calendar-tooltip">
              <Icon>help_outline</Icon>
            </div>
          </ArrowTooltip>
        </div>
      </div>
      {isLargeScreen ? renderCalendar() : renderList()}
    </>
  );
};
