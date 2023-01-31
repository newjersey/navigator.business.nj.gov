import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { FilingsCalendarAsList } from "@/components/filings-calendar/FilingsCalendarAsList";
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
import { LookupOperatingPhaseById, TaxFiling, UserData } from "@businessnjgovnavigator/shared/index";
import { useMediaQuery } from "@mui/material";
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
  const [showModal, setShowModal] = useState<boolean>(false);

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

  const renderCalendar = (): ReactElement => {
    const type = LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarType;
    if (type === "LIST")
      return (
        <FilingsCalendarAsList operateReferences={props.operateReferences} userData={userData as UserData} />
      );
    if (type === "FULL") {
      if (isLargeScreen && userData?.preferences.isCalendarFullView)
        return <FilingsCalendarGrid operateReferences={props.operateReferences} userData={userData} />;
      return (
        <FilingsCalendarAsList operateReferences={props.operateReferences} userData={userData as UserData} />
      );
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
    <>
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
              <div className="h6-styling">
                <span className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</span>{" "}
                <Button
                  style="tertiary"
                  onClick={() => {
                    analytics.event.tax_calendar_feedback_button.click.show_feedback_modal();
                    setShowModal(true);
                  }}
                >
                  <span>{Config.dashboardDefaults.calendarFeedbackButtonText}</span>
                </Button>
              </div>
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
      {showModal && (
        <FeedbackModal
          isOpen={showModal}
          handleClose={() => {
            return setShowModal(false);
          }}
        />
      )}
    </>
  );
};
