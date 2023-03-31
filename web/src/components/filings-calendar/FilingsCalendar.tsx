import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { EmptyCalendar } from "@/components/filings-calendar/EmptyCalendar";
import { FilingsCalendarAsList } from "@/components/filings-calendar/FilingsCalendarAsList";
import { FilingsCalendarGrid } from "@/components/filings-calendar/FilingsCalendarGrid";
import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { ThreeYearSelector } from "@/components/njwds-extended/ThreeYearSelector";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  getCurrentDate,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  UserData,
} from "@businessnjgovnavigator/shared/index";
import { useMediaQuery } from "@mui/material";
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
  const [showModal, setShowModal] = useState<boolean>(false);

  const currentDate = getCurrentDate();
  const currentYear = getCurrentDate().year().toString();
  const [activeYear, setActiveYear] = useState<string>(currentYear);

  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const shouldRenderFilingsCalendarTaxAccess = (userData?: UserData): boolean => {
    if (!userData) {
      return false;
    }
    return LookupOperatingPhaseById(userData.profileData.operatingPhase).displayTaxAccessButton;
  };

  const showFormationDatePrompt = (): boolean => {
    if (!userData) return false;
    return (
      LookupLegalStructureById(userData.profileData.legalStructureId).elementsToDisplay.has(
        "formationDate"
      ) && !userData.profileData.dateOfFormation
    );
  };

  const renderCalendar = (): ReactElement => {
    const type = LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayCalendarType;
    if (type === "LIST")
      return (
        <FilingsCalendarAsList
          operateReferences={props.operateReferences}
          userData={userData as UserData}
          activeYear={activeYear}
        />
      );
    if (type === "FULL") {
      if (isLargeScreen && userData?.preferences.isCalendarFullView)
        return (
          <FilingsCalendarGrid
            operateReferences={props.operateReferences}
            userData={userData}
            activeYear={activeYear}
          />
        );
      return (
        <FilingsCalendarAsList
          operateReferences={props.operateReferences}
          userData={userData as UserData}
          activeYear={activeYear}
        />
      );
    }
    return <></>;
  };

  const renderToggleButton = (): ReactElement => {
    const displayToggleButton =
      userData?.taxFilingData?.filings &&
      userData?.taxFilingData?.filings.length > 0 &&
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
        <UnStyledButton
          style="light"
          noRightMargin
          className="font-body-2xs padding-y-05 padding-x-1"
          onClick={handleCalendarOnClick}
        >
          <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
          {Config.dashboardDefaults.calendarListViewButton}
        </UnStyledButton>
      ) : (
        <UnStyledButton
          style="light"
          noRightMargin
          className="font-body-2xs padding-y-05 padding-x-1"
          onClick={handleCalendarOnClick}
        >
          <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
          {Config.dashboardDefaults.calendarGridViewButton}
        </UnStyledButton>
      );
    }

    return <></>;
  };

  return (
    <>
      <div className="calendar-container" data-testid="filings-calendar">
        <div className="flex mobile-lg:flex-align-end flex-justify flex-column mobile-lg:flex-row">
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
          <div className="flex flex-row flex-align-end flex-justify-center mobile-lg:flex-justify">
            {userData?.taxFilingData?.filings && userData?.taxFilingData.filings.length > 0 ? (
              <ThreeYearSelector
                className="tablet:margin-right-2"
                activeYear={activeYear}
                years={[
                  currentYear,
                  currentDate.add(1, "year").year().toString(),
                  currentDate.add(2, "year").year().toString(),
                ]}
                onChange={(year) => {
                  setActiveYear(year);
                }}
              />
            ) : (
              <></>
            )}
            {renderToggleButton()}
          </div>
        </div>
        <hr className="bg-base-lighter margin-top-2 margin-bottom-4" aria-hidden={true} />
        {shouldRenderFilingsCalendarTaxAccess(userData) && <FilingsCalendarTaxAccess />}
        {userData?.taxFilingData?.filings && userData?.taxFilingData.filings.length > 0 ? (
          <>
            {renderCalendar()}
            {showFormationDatePrompt() && (
              <div data-testid="formation-date-prompt" className="margin-top-2">
                <Content>{Config.dashboardDefaults.calendarAddDateMd}</Content>
              </div>
            )}
            <div className="margin-top-2">
              <div className="h6-styling">
                <span className="text-base-dark">{Config.dashboardDefaults.calendarLegalText}</span>{" "}
                <UnStyledButton
                  style="tertiary"
                  underline
                  onClick={() => {
                    analytics.event.tax_calendar_feedback_button.click.show_feedback_modal();
                    setShowModal(true);
                  }}
                >
                  <span>{Config.dashboardDefaults.calendarFeedbackButtonText}</span>
                </UnStyledButton>
              </div>
            </div>
          </>
        ) : (
          <>
            <EmptyCalendar />
            {showFormationDatePrompt() && (
              <div data-testid="formation-date-prompt" className="margin-top-2">
                <Content>{Config.dashboardDefaults.calendarAddDateMd}</Content>
              </div>
            )}
          </>
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
