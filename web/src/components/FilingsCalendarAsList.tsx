import {
  FilingsCalendarTaxAccess,
  shouldRenderFilingsCalendarTaxAccess,
} from "@/components/FilingsCalendarTaxAccess";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortFilterFilingsWithinAYear } from "@/lib/domain-logic/filterFilings";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { parseDateWithFormat } from "@businessnjgovnavigator/shared/";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { ReactElement } from "react";
import { ArrowTooltip } from "./ArrowTooltip";
import { Button } from "./njwds-extended/Button";
import { Icon } from "./njwds/Icon";

interface Props {
  operateReferences: Record<string, OperateReference>;
  onToggle?: () => void;
}

export const FilingsCalendarAsList = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { Config } = useConfig();
  const isDesktopAndUp = useMediaQuery(MediaQueries.tabletAndUp);

  const sortedFilteredFilingsWithinAYear = userData?.taxFilingData.filings
    ? sortFilterFilingsWithinAYear(userData.taxFilingData.filings)
    : [];

  if (sortedFilteredFilingsWithinAYear.length === 0) return <></>;

  return (
    <div data-testid="filings-calendar-as-list">
      <div className="calendar-container">
        <div className="flex flex-align-end padding-top-2 margin-bottom-1 flex-justify">
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
          {isDesktopAndUp && props.onToggle && (
            <Button
              style="light"
              noRightMargin
              className="font-body-2xs padding-y-05 padding-x-1"
              onClick={props.onToggle}
            >
              <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
              {Config.dashboardDefaults.calendarGridViewButton}
            </Button>
          )}
        </div>
        <hr className="bg-base-lighter margin-top-0 margin-bottom-4" aria-hidden={true} />
        {shouldRenderFilingsCalendarTaxAccess(userData) && <FilingsCalendarTaxAccess />}
        {sortedFilteredFilingsWithinAYear
          .filter((filing) => props.operateReferences[filing.identifier])
          .map((filing) => (
            <div className="flex margin-bottom-2 minh-6" key={`${filing.identifier}-${filing.dueDate}`}>
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
          ))}
      </div>
      <p className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</p>
    </div>
  );
};
