import { FilingsCalendarSingleGrid } from "@/components/filings-calendar/FilingsCalendarSingleGrid";
import { isCalendarMonthLessThanCurrentMonth } from "@/lib/domain-logic/filterFilings";
import { OperateReference } from "@/lib/types/types";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  operateReferences: Record<string, OperateReference>;
  userData: UserData;
}

export const FilingsCalendarGrid = (props: Props): ReactElement => {
  const monthIndices = [...Array(12).keys()];
  const monthsPerRow = 3;
  const rowIndices = monthIndices.filter((num) => {
    return num % monthsPerRow === 0;
  });

  return (
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
                      isCalendarMonthLessThanCurrentMonth(month)
                        ? "td-gray-border bg-base-extra-light"
                        : "td-gray-border"
                    }
                  >
                    <FilingsCalendarSingleGrid
                      num={month}
                      operateReferences={props.operateReferences}
                      userData={props.userData}
                    />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
