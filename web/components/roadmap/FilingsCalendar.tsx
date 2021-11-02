import React, { ReactElement } from "react";
import { getCurrentDate } from "@/lib/utils/getCurrentDate";
import { FilingReference, TaxFiling } from "@/lib/types/types";
import dayjs from "dayjs";
import { RoadmapDefaults } from "@/display-content/roadmap/RoadmapDefaults";
import { Icon } from "@/components/njwds/Icon";
import { ArrowTooltip } from "@/components/ArrowTooltip";
import { useMediaQuery } from "@mui/material";
import { MediaQueries } from "@/lib/PageSizes";
import Link from "next/link";
import { Tag } from "../njwds-extended/Tag";

interface Props {
  taxFilings: TaxFiling[];
  filingsReferences: Record<string, FilingReference>;
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
          {thisMonthFilings
            .filter((filing) => props.filingsReferences[filing.identifier])
            .map((filing) => (
              <div key={filing.identifier} className="line-height-1">
                <Link href={`filings/${props.filingsReferences[filing.identifier].urlSlug}`}>
                  <a
                    href={`filings/${props.filingsReferences[filing.identifier].urlSlug}`}
                    data-testid={filing.identifier.toLowerCase()}
                    className="usa-link text-secondary-darker text-secondary-darker:hover text-no-underline"
                  >
                    <Tag
                      textWrap={true}
                      tagVariant="info"
                      className="accent-cool-hover-override width-full display-block width-auto"
                    >
                      {" "}
                      <span className="text-bold text-uppercase ">
                        {RoadmapDefaults.calendarFilingDueDateLabel}{" "}
                        {dayjs(filing.dueDate, "YYYY-MM-DD").format("M/D")}
                      </span>
                      {" - "}
                      <span className="text-no-uppercase">
                        {props.filingsReferences[filing.identifier].name}
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
