import React, { ReactElement } from "react";
import { getCurrentDate } from "@/lib/utils/getCurrentDate";
import { TaxFiling } from "@/lib/types/types";
import dayjs from "dayjs";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { TaxFilingNameLookup } from "@/display-content/roadmap/operate/TaxFilingNameLookup";
import { Icon } from "@/components/njwds/Icon";
import { ArrowTooltip } from "@/components/ArrowTooltip";
import { useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";

interface Props {
  taxFilings: TaxFiling[];
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const getMonth = (num: number): ReactElement => {
    const date = getCurrentDate().add(num, "months");
    let textColor = "text-base-dark";
    if (getCurrentDate().month() === date.month()) {
      textColor = "text-green";
    }

    const thisMonthFilings = props.taxFilings.filter(
      (it) => dayjs(it.dueDate, "YYYY-MM-DD").month() === date.month()
    );

    return (
      <div data-testid={date.format("MMM YYYY")}>
        <div className={`${textColor} padding-bottom-1`}>
          <span className="text-bold">{date.format("MMM")}</span> <span>{date.format("YYYY")}</span>
        </div>
        <div>
          {thisMonthFilings.map((filing) => (
            <div key={filing.identifier} className="usa-tag bg-secondary-lighter text-secondary-darker">
              <span className="text-bold text-uppercase">
                {RoadmapDefaults.calendarFilingDueDateLabel}{" "}
                {dayjs(filing.dueDate, "YYYY-MM-DD").format("M/D")}
              </span>
              {" - "}
              <span className="text-no-uppercase">{TaxFilingNameLookup[filing.identifier]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const getTableRows = (): ReactElement[] => {
    const monthIndices = Array.from(Array(12).keys());

    let monthsPerRow = 4;
    if (!isLargeScreen) {
      monthsPerRow = 2;
    }

    const rowIndices = monthIndices.filter((num) => num % monthsPerRow === 0);

    return rowIndices.map((rowIndex) => {
      const monthIndicesForRow = monthIndices.slice(rowIndex, rowIndex + monthsPerRow);
      return (
        <tr key={rowIndex}>
          {monthIndicesForRow.map((month) => (
            <td key={month}>{getMonth(month)}</td>
          ))}
        </tr>
      );
    });
  };

  return (
    <>
      <div className="fdr fac padding-top-2">
        <h3 className="">{RoadmapDefaults.calendarHeader}</h3>
        <ArrowTooltip title={RoadmapDefaults.calendarTooltip}>
          <div className="fdr fac margin-left-1 font-body-lg text-green" data-testid="calendar-tooltip">
            <Icon>help_outline</Icon>
          </div>
        </ArrowTooltip>
      </div>
      <table>
        <tbody>{getTableRows()}</tbody>
      </table>
    </>
  );
};
