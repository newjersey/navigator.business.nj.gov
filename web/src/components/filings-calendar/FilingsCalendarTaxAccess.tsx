import { Content } from "@/components/Content";
import { TaxAccess } from "@/components/filings-calendar/tax-access/TaxAccess";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { postTaxFilingsLookup } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { getCurrentDate, parseDate } from "@businessnjgovnavigator/shared";
import { ReactElement, useContext, useState } from "react";

const isBeforeTheFollowingSaturday = (registeredISO: string | undefined): boolean => {
  const sundayAfterRegisteredDate = parseDate(registeredISO).day(7);
  return getCurrentDate().isBefore(sundayAfterRegisteredDate);
};

export const FilingsCalendarTaxAccess = (): ReactElement => {
  const { updateQueue, business } = useUserData();
  const { Config } = useConfig();
  const { isAuthenticated, setShowNeedsAccountModal } = useContext(NeedsAccountContext);
  const [showAlert, setShowAlert] = useState(false);

  useMountEffectWhenDefined(() => {
    if (!business) return;
    (async (): Promise<void> => {
      if (business.taxFilingData.registeredISO) {
        const updatedUserData = await postTaxFilingsLookup({
          businessName: business.taxFilingData.businessName as string,
          taxId: business.profileData.taxId as string,
          encryptedTaxId: business.profileData.encryptedTaxId as string,
        });

        updateQueue?.queue(updatedUserData).update();
      }
    })();
  }, business);

  const getUnauthenticatedUserComponent = (): ReactElement => {
    return (
      <>
        <div className="margin-bottom-2 mobile-lg:margin-bottom-0 margin-right-1 mobile-lg:grid-col-6 grid-col-12">
          <Content>{Config.taxCalendar.accessBody}</Content>
        </div>
        <PrimaryButton
          isColor="primary"
          dataTestId="get-tax-access"
          isRightMarginRemoved={true}
          onClick={(): void => {
            updateQueue
              ?.queuePreferences({
                returnToLink: `${ROUTES.dashboard}`,
              })
              .update();
            analytics.event.tax_calendar_register_button.click.show_myNJ_registration_prompt_modal();
            setShowNeedsAccountModal(true);
          }}
        >
          {Config.taxCalendar.accessButton}
        </PrimaryButton>
      </>
    );
  };

  const getWidgetComponent = (): ReactElement => {
    if (business?.taxFilingData.registeredISO) {
      if (business?.taxFilingData.state === "PENDING") {
        return (
          <div className="tax-calendar-upper-widget-container" data-testid="pending-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.pendingCopyMarkdown}</Content>
            </div>
          </div>
        );
      } else if (isBeforeTheFollowingSaturday(business.taxFilingData.registeredISO)) {
        return (
          <div
            className="tax-calendar-upper-widget-container"
            data-testid="alert-content-container"
          >
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.registrationFollowUpCopyMarkdown}</Content>
            </div>
          </div>
        );
      } else {
        return <></>;
      }
    } else {
      return (
        <div
          className="tax-calendar-upper-widget-container border-primary-light grid-row"
          data-testid="tax-access-container"
        >
          {isAuthenticated === IsAuthenticated.TRUE ? (
            <TaxAccess onSuccess={(): void => setShowAlert(true)} />
          ) : (
            getUnauthenticatedUserComponent()
          )}
        </div>
      );
    }
  };

  return (
    <>
      <SnackbarAlert
        variant={"success"}
        isOpen={showAlert}
        autoHideDuration={null}
        close={(): void => setShowAlert(false)}
        closeIcon={true}
        heading={Config.taxCalendar.snackbarSuccessHeader}
        dataTestid={"tax-success"}
      >
        <Content>{Config.taxCalendar.snackbarSuccessBody}</Content>
      </SnackbarAlert>
      {getWidgetComponent()}
    </>
  );
};
