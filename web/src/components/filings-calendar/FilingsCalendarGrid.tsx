import { Content } from "@/components/Content";
import { FilingsCalendarSingleGrid } from "@/components/filings-calendar/FilingsCalendarSingleGrid";
import { useConfig } from "@/lib/data-hooks/useConfig";
import {
  isCalendarMonthLessThanCurrentMonth,
  sortFilterCalendarEventsWithinAYear,
} from "@/lib/domain-logic/filterCalendarEvents";
import { LicenseEventType, OperateReference } from "@/lib/types/types";
import { getCurrentDate } from "@businessnjgovnavigator/shared/dateHelpers";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  operateReferences: Record<string, OperateReference>;
  business: Business;
  activeYear: string;
  licenseEvents: LicenseEventType[];
}

export const FilingsCalendarGrid = (props: Props): ReactElement => {
  const { Config } = useConfig();

  const monthIndices = [...Array(12).keys()];
  const monthsPerRow = 3;
  const rowIndices = monthIndices.filter((num) => {
    return num % monthsPerRow === 0;
  });

  return (
    <div>
      {sortFilterCalendarEventsWithinAYear(props.business.taxFilingData.filings, props.activeYear).length ===
        0 && (
        <Content className="text-base margin-bottom-3">
          {Config.dashboardDefaults.calendarEmptyDescriptionMarkdown}
        </Content>
      )}
      <table className="filingsCalendarTable" data-testid="filings-calendar-as-table">
        <tbody>
          {rowIndices.map((rowIndex) => {
            const monthIndicesForRow = monthIndices.slice(rowIndex, rowIndex + monthsPerRow);
            return (
              <tr key={rowIndex}>
                {monthIndicesForRow.map((month) => {
                  return (
                    <td
                      key={month}
                      className={
                        isCalendarMonthLessThanCurrentMonth(month) &&
                        props.activeYear === getCurrentDate().year().toString()
                          ? "td-gray-border bg-base-extra-light"
                          : "td-gray-border"
                      }
                    >
                      <FilingsCalendarSingleGrid
                        num={month}
                        operateReferences={props.operateReferences}
                        business={props.business}
                        activeYear={props.activeYear}
                        licenseEvents={props.licenseEvents}
                      />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
