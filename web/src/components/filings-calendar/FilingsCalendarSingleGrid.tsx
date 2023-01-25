import { Tag } from "@/components/njwds-extended/Tag";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  isCalendarMonthLessThanCurrentMonth,
  sortFilterFilingsWithinAYear,
} from "@/lib/domain-logic/filterFilings";
import { OperateReference } from "@/lib/types/types";
import {
  defaultDateFormat,
  getCurrentDate,
  getJanOfCurrentYear,
  parseDateWithFormat,
  TaxFiling,
  UserData,
} from "@businessnjgovnavigator/shared";
import Link from "next/link";

interface Props {
  userData: UserData;
  num: number;
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendarSingleGrid = (props: Props) => {
  const { Config } = useConfig();
  const date = getJanOfCurrentYear().add(props.num, "months");
  const sortedFilteredFilingsWithinAYear: TaxFiling[] = props.userData?.taxFilingData.filings
    ? sortFilterFilingsWithinAYear(props.userData.taxFilingData.filings)
    : [];
  const thisMonthFilings = sortedFilteredFilingsWithinAYear.filter((it) => {
    return (
      parseDateWithFormat(it.dueDate, defaultDateFormat).month() === date.month() &&
      parseDateWithFormat(it.dueDate, defaultDateFormat).year() === date.year()
    );
  });

  return (
    <div data-testid={date.format("MMM YYYY")}>
      <div
        className={`${
          getCurrentDate().month() === date.month() ? "text-green" : "text-base-dark"
        } padding-bottom-1`}
        aria-hidden="true"
      >
        <span className="text-bold">{date.format("MMM")}</span> <span>{date.format("YYYY")}</span>
      </div>
      <div>
        {!isCalendarMonthLessThanCurrentMonth(props.num) &&
          thisMonthFilings
            .filter((filing) => {
              return props.operateReferences[filing.identifier];
            })
            .map((filing) => {
              return (
                <div key={filing.identifier} className="line-height-1 margin-bottom-1" data-testid="filing">
                  <Tag backgroundColor="warning-extra-light" isHover isRadiusMd isWrappingText>
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
            })}
      </div>
    </div>
  );
};
