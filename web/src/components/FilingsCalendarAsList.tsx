import { useUserData } from "@/lib/data-hooks/useUserData";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getTaxFilings } from "@/lib/utils/helpers";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendarAsList = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const taxFilings = getTaxFilings(userData);

  return (
    <div data-testid="filings-calendar-as-list">
      {taxFilings
        .filter((filing) => props.operateReferences[filing.identifier])
        .map((filing) => (
          <div key={`${filing.identifier}-${filing.dueDate}`} className="flex margin-bottom-2 minh-6">
            <div className="width-05 bg-primary"></div>
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
        ))}
    </div>
  );
};
