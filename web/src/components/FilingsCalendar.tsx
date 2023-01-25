import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FilingsCalendarGrid } from "@/components/filings-calendar/FilingsCalendarGrid";
import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { sortFilterFilingsWithinAYear } from "@/lib/domain-logic/filterFilings";
import { ROUTES } from "@/lib/domain-logic/routes";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { groupBy } from "@/lib/utils/helpers";
import {
  defaultDateFormat,
  LookupOperatingPhaseById,
  parseDateWithFormat,
  TaxFiling,
  UserData,
} from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useState } from "react";

interface Props {
  operateReferences: Record<string, OperateReference>;
  CMS_ONLY_fakeUserData?: UserData; // for CMS only
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const userDataFromHook = useUserData();
  const update = userDataFromHook.update;
  const userData = props.CMS_ONLY_fakeUserData ?? userDataFromHook.userData;
  const router = useRouter();
  const listViewMoreIncrement = 5;
  const [numberOfVisibleCalendarEntries, setNumberOfVisibleCalendarEntries] =
    useState<number>(listViewMoreIncrement);

  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const sortedFilteredFilingsWithinAYear: TaxFiling[] = userData?.taxFilingData.filings
    ? sortFilterFilingsWithinAYear(userData.taxFilingData.filings)
    : [];

  const editOnClick = () => {
    analytics.event.roadmap_profile_edit_button.click.go_to_profile_screen();
    router.push(ROUTES.profile);
  };

  const shouldRenderFilingsCalendarTaxAccess = (userData?: UserData): boolean => {
    if (!userData) {
      return false;
    }
    return LookupOperatingPhaseById(userData.profileData.operatingPhase).displayTaxAccessButton;
  };

  const renderCalendarAsList = (): ReactElement => {
    if (sortedFilteredFilingsWithinAYear.length === 0) {
      return <></>;
    }

    const filingsGroupedByDate = groupBy(
      sortedFilteredFilingsWithinAYear.filter((filing) => {
        return props.operateReferences[filing.identifier];
      }),
      (value) => value.dueDate
    );

    const visibleFilings = filingsGroupedByDate.slice(0, numberOfVisibleCalendarEntries);

    return (
      <div data-testid="filings-calendar-as-list">
        {visibleFilings.map((filings) => {
          return (
            <div
              className="flex margin-bottom-2 minh-6"
              key={filings[0].dueDate}
              data-testid="calendar-list-entry"
            >
              <div className="width-05 bg-primary minw-05" />
              <div className="margin-left-205">
                <div className="text-bold">
                  {parseDateWithFormat(filings[0].dueDate, defaultDateFormat).format("MMMM D, YYYY")}
                </div>
                {filings.map((filing, index) => (
                  <div
                    key={`${filing.identifier}-${filing.dueDate}`}
                    className={`margin-bottom-05 ${index == 0 ? "margin-top-05" : ""}`}
                  >
                    <Link href={`filings/${props.operateReferences[filing.identifier].urlSlug}`} passHref>
                      <a
                        href={`filings/${props.operateReferences[filing.identifier].urlSlug}`}
                        onClick={() => {
                          analytics.event.calendar_date.click.go_to_date_detail_screen();
                        }}
                      >
                        {props.operateReferences[filing.identifier].name}{" "}
                        {parseDateWithFormat(filing.dueDate, defaultDateFormat).format("YYYY")}
                      </a>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {filingsGroupedByDate.length > numberOfVisibleCalendarEntries && (
          <Button
            style={"tertiary"}
            underline={true}
            onClick={() => setNumberOfVisibleCalendarEntries((previous) => previous + listViewMoreIncrement)}
          >
            {Config.dashboardDefaults.calendarListViewMoreButton}
          </Button>
        )}
        <hr />
      </div>
    );
  };

  const renderCalendar = (): ReactElement => {
    const type = LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarType;
    if (type === "LIST") return renderCalendarAsList();
    if (type === "FULL") {
      if (isLargeScreen && userData?.preferences.isCalendarFullView)
        return <FilingsCalendarGrid operateReferences={props.operateReferences} userData={userData} />;
      return renderCalendarAsList();
    }
    return <></>;
  };

  const renderToggleButton = (): ReactElement => {
    const displayToggleButton =
      sortedFilteredFilingsWithinAYear.length > 0 &&
      LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarToggleButton &&
      isLargeScreen;

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

    if (displayToggleButton) {
      return userData?.preferences.isCalendarFullView ? (
        <Button
          style="light"
          noRightMargin
          className="font-body-2xs padding-y-05 padding-x-1"
          onClick={handleCalendarOnClick}
        >
          <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
          {Config.dashboardDefaults.calendarListViewButton}
        </Button>
      ) : (
        <Button
          style="light"
          noRightMargin
          className="font-body-2xs padding-y-05 padding-x-1"
          onClick={handleCalendarOnClick}
        >
          <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
          {Config.dashboardDefaults.calendarGridViewButton}
        </Button>
      );
    }

    return <></>;
  };

  return (
    <div className="calendar-container">
      <div className="flex flex-align-end flex-justify" data-testid="filings-calendar">
        <div className="flex flex-align-end">
          <h2 className="margin-bottom-0 text-medium">{Config.dashboardDefaults.calendarHeader}</h2>
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
        {renderToggleButton()}
      </div>
      <hr className="bg-base-lighter margin-top-2 margin-bottom-4" aria-hidden={true} />
      {shouldRenderFilingsCalendarTaxAccess(userData) && <FilingsCalendarTaxAccess />}
      {sortedFilteredFilingsWithinAYear.length > 0 ? (
        <>
          {renderCalendar()}
          <div className="margin-top-2">
            <p className="text-base-dark h6-styling">{Config.dashboardDefaults.calendarLegalText}</p>
          </div>
        </>
      ) : (
        <div data-testid="empty-calendar" className="padding-y-0">
          <div className="flex flex-column space-between fac text-align-center flex-desktop:grid-col usa-prose padding-y-205 padding-x-3">
            <Content>{Config.dashboardDefaults.emptyCalendarTitleText}</Content>
            <img className="padding-y-2" src={`/img/empty-trophy-illustration.png`} alt="empty calendar" />
            {userData?.taxFilingData && userData?.taxFilingData.filings.length === 0 && (
              <Content onClick={editOnClick}>{Config.dashboardDefaults.emptyCalendarBodyText}</Content>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
