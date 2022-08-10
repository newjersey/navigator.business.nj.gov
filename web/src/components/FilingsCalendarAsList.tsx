import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/";
import Link from "next/link";
import { ReactElement } from "react";
import { ArrowTooltip } from "./ArrowTooltip";
import { Icon } from "./njwds/Icon";

interface Props {
  operateReferences: Record<string, OperateReference>;
}

export const FilingsCalendarAsList = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const taxFilings = userData?.taxFilingData.filings || [];
  const { Config } = useConfig();

  if (taxFilings.length === 0) return <></>;

  return (
    <div data-testid="filings-calendar-as-list">
      {taxFilings
        .filter((filing) => props.operateReferences[filing.identifier])
        .map((filing) => (
          <div
            key={`${filing.identifier}-${filing.dueDate}`}
            className="margin-top-6 bg-roadmap-blue border-base-lightest border-2px padding-top-3 padding-bottom-1 padding-x-4 radius-lg"
          >
            <div className="flex">
              <div className="h3-styling text-normal">{Config.dashboardDefaults.calendarHeader}</div>
              <div>
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
            <hr className="bg-base-lighter margin-top-0 margin-bottom-4" aria-hidden={true} />
            <div className="flex margin-bottom-2 minh-6">
              <div className="width-05 bg-primary" />
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
          </div>
        ))}
      <p className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</p>
    </div>
  );
};
