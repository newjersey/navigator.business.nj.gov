import { ArrowTooltip } from "@/components/ArrowTooltip";
import { Content } from "@/components/Content";
import { EmptyCalendar } from "@/components/filings-calendar/EmptyCalendar";
import { FilingsCalendarAsList } from "@/components/filings-calendar/FilingsCalendarAsList";
import { FilingsCalendarGrid } from "@/components/filings-calendar/FilingsCalendarGrid";
import { FilingsCalendarTaxAccess } from "@/components/filings-calendar/FilingsCalendarTaxAccess";
import { Heading } from "@/components/njwds-extended/Heading";
import { SecondaryButton } from "@/components/njwds-extended/SecondaryButton";
import { ThreeYearSelector } from "@/components/njwds-extended/ThreeYearSelector";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import { LicenseEventType, OperateReference } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import {
  Business,
  getCurrentDate,
  LookupLegalStructureById,
  LookupOperatingPhaseById,
} from "@businessnjgovnavigator/shared";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useState } from "react";

interface Props {
  operateReferences: Record<string, OperateReference>;
  CMS_ONLY_fakeBusiness?: Business;
  licenseEvents: LicenseEventType[];
}

export const FilingsCalendar = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const { updateQueue } = useUserData();
  const business = props.CMS_ONLY_fakeBusiness ?? updateQueue?.currentBusiness();

  const currentDate = getCurrentDate();
  const currentYear = getCurrentDate().year().toString();
  const [activeYear, setActiveYear] = useState<string>(currentYear);

  const isLargeScreen = useMediaQuery(MediaQueries.tabletAndUp);

  const shouldRenderFilingsCalendarTaxAccess = (business?: Business): boolean => {
    if (!business) return false;
    return LookupOperatingPhaseById(business.profileData.operatingPhase).displayTaxAccessButton;
  };

  const showFormationDatePrompt = (): boolean => {
    if (!business) return false;
    return (
      LookupLegalStructureById(business.profileData.legalStructureId).elementsToDisplay.has(
        "formationDate"
      ) && !business.profileData.dateOfFormation
    );
  };

  const renderCalendar = (): ReactElement => {
    const type = LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCalendarType;
    if (type === "LIST")
      return (
        <FilingsCalendarAsList
          operateReferences={props.operateReferences}
          business={business as Business}
          activeYear={activeYear}
          licenseEvents={props.licenseEvents}
        />
      );
    if (type === "FULL") {
      if (isLargeScreen && business?.preferences.isCalendarFullView)
        return (
          <FilingsCalendarGrid
            operateReferences={props.operateReferences}
            business={business}
            activeYear={activeYear}
            licenseEvents={props.licenseEvents}
          />
        );
      return (
        <FilingsCalendarAsList
          operateReferences={props.operateReferences}
          business={business as Business}
          activeYear={activeYear}
          licenseEvents={props.licenseEvents}
        />
      );
    }
    return <></>;
  };

  const renderToggleButton = (): ReactElement => {
    const displayToggleButton =
      business?.taxFilingData?.filings &&
      business?.taxFilingData?.filings.length > 0 &&
      LookupOperatingPhaseById(business?.profileData.operatingPhase).displayCalendarToggleButton &&
      isLargeScreen;

    const handleCalendarOnClick = (): void => {
      if (!business || !updateQueue) return;

      updateQueue
        .queuePreferences({
          isCalendarFullView: !business.preferences.isCalendarFullView,
        })
        .update();
    };

    if (displayToggleButton) {
      return (
        <SecondaryButton
          size={"regular"}
          isColor={"border-base-light"}
          isRightMarginRemoved
          onClick={handleCalendarOnClick}
        >
          {business?.preferences.isCalendarFullView ? (
            <>
              <Icon className="usa-icon--size-3 margin-right-05">list</Icon>
              {Config.dashboardDefaults.calendarListViewButton}
            </>
          ) : (
            <>
              <Icon className="usa-icon--size-3 margin-right-05">grid_view</Icon>
              {Config.dashboardDefaults.calendarGridViewButton}
            </>
          )}
        </SecondaryButton>
      );
    }

    return <></>;
  };

  return (
    <>
      <div className="calendar-container" data-testid="filings-calendar">
        <div className="flex mobile-lg:flex-align-end flex-justify flex-column mobile-lg:flex-row">
          <div className="flex flex-align-end">
            <Heading level={2} className="margin-bottom-0 text-medium">
              {Config.dashboardDefaults.calendarHeader}
            </Heading>
            <div
              className={`margin-top-05 margin-left-1 margin-bottom-05 ${
                isLargeScreen ? "padding-bottom-2" : "padding-bottom-1"
              }`}
            >
              <ArrowTooltip title={Config.dashboardDefaults.calendarTooltip}>
                <div className="fdr fac font-body-lg text-green" data-testid="calendar-tooltip">
                  <Icon>help_outline</Icon>
                </div>
              </ArrowTooltip>
            </div>
          </div>
          <div className="flex flex-row flex-align-end flex-justify-center mobile-lg:flex-justify">
            {business?.taxFilingData?.filings && business?.taxFilingData.filings.length > 0 ? (
              <ThreeYearSelector
                className="tablet:margin-right-2"
                activeYear={activeYear}
                years={[
                  currentYear,
                  currentDate.add(1, "year").year().toString(),
                  currentDate.add(2, "year").year().toString(),
                ]}
                onChange={(year): void => setActiveYear(year)}
              />
            ) : (
              <></>
            )}
            {renderToggleButton()}
          </div>
        </div>
        <hr className="bg-base-lighter margin-top-2 margin-bottom-4" aria-hidden={true} />
        {shouldRenderFilingsCalendarTaxAccess(business) && <FilingsCalendarTaxAccess />}
        {business?.taxFilingData?.filings && business?.taxFilingData.filings.length > 0 ? (
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
                  isUnderline
                  isIntercomEnabled
                  onClick={(): void => {
                    analytics.event.share_calendar_feedback.click.open_live_chat();
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
    </>
  );
};
