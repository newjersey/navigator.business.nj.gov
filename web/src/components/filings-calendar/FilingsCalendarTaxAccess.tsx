import { Content } from "@/components/Content";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { postTaxFilingsLookup } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
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
  const [businessName, setBusinessName] = useState(business?.taxFilingData.businessName || "");
  const [taxId, setTaxId] = useState(business?.profileData.taxId || "");
  const [showTaxId, setShowTaxId] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [error, setError] = useState("");

  const openRegisterModal = (): void => {
    if (!business || isAuthenticated !== IsAuthenticated.FALSE) return;

    updateQueue
      ?.queuePreferences({
        returnToLink: `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`,
      })
      .update();

    analytics.event.tax_calendar_banner_button.click.show_myNJ_registration_prompt_modal();
    setShowNeedsAccountModal(true);
  };

  const handleTaxLookupSubmit = async (): Promise<void> => {
    if (!business || !updateQueue) return;

    setIsSubmitting(true);
    setError("");

    try {
      analytics.event.tax_calendar_banner_button.click.show_tax_calendar();

      const updatedUserData = await postTaxFilingsLookup({
        businessName,
        taxId,
        encryptedTaxId: business.profileData.encryptedTaxId || "",
      });

      updateQueue.queue(updatedUserData).update();
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
      }, 5000);
    } catch (error) {
      console.error("Error looking up tax filings:", error);
      setError("There was an error looking up your tax filings. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
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
          <div className="tax-calendar-upper-widget-container" data-testid="alert-content-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.registrationFollowUpCopyMarkdown}</Content>
            </div>
          </div>
        );
      } else {
        return <></>;
      }
    }

    // Guest user
    if (isAuthenticated === IsAuthenticated.FALSE) {
      return (
        <div className="tax-calendar-upper-widget-container" data-testid="guest-access-widget">
          <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
            <Content>
              {Config.taxCalendar.accessBody ||
                "To access your tax calendar, you'll need to create or link a myNJ account."}
            </Content>
          </div>
          <PrimaryButton
            isColor="primary"
            dataTestId="create-account-access"
            onClick={(): void => {
              analytics.event.tax_calendar_banner_button.click.show_myNJ_registration_prompt_modal();
              setShowNeedsAccountModal(true);
            }}
          >
            {Config.taxCalendar.accessButton || "Access My Calendar"}
          </PrimaryButton>
        </div>
      );
    }

    // Authenticated user
    return (
      <div className="tax-access-container" data-testid="tax-access-form">
        <SnackbarAlert
          variant={"success"}
          isOpen={showAlert}
          autoHideDuration={5000}
          close={(): void => setShowAlert(false)}
          closeIcon={true}
          heading={Config.taxCalendar.snackbarSuccessHeader}
          dataTestid={"tax-success"}
        >
          <Content>{Config.taxCalendar.snackbarSuccessBody}</Content>
        </SnackbarAlert>

        {error && (
          <div className="usa-alert usa-alert--error margin-bottom-2" role="alert">
            <div className="usa-alert__body">
              <p className="usa-alert__text">{error}</p>
            </div>
          </div>
        )}

        <h2 className="font-heading-xl margin-top-0 margin-bottom-2">
          <span role="img" aria-label="Bell">
            🔔
          </span>{" "}
          Track Your Tax Due Dates
        </h2>

        <p className="margin-bottom-4">
          To get access, we need to collect some information and register you with{" "}
          <a href="https://gov2go.com" target="_blank" rel="noopener noreferrer">
            Gov2Go
          </a>
          .
        </p>

        <div className="margin-bottom-4">
          <label className="usa-label text-bold" htmlFor="business-name">
            Business Name
          </label>
          <div className="margin-bottom-1">
            Enter as shown on your{" "}
            <a
              href="https://business.nj.gov/registration-certificate"
              target="_blank"
              rel="noopener noreferrer"
            >
              Certificate of Formation
            </a>
            .
          </div>
          <input
            className="usa-input"
            id="business-name"
            type="text"
            value={businessName}
            onChange={(e): void => setBusinessName(e.target.value)}
            onFocus={openRegisterModal}
          />
        </div>

        <div className="margin-bottom-4">
          <label className="usa-label text-bold" htmlFor="tax-id">
            New Jersey Tax ID
          </label>
          <div className="margin-bottom-1">
            Enter the 12-digit ID shown in your &lsquo;Confirmation of New Jersey Business Registration&rsquo;
            email.
          </div>
          <div className="position-relative">
            <input
              className="usa-input"
              id="tax-id"
              type={showTaxId ? "text" : "password"}
              value={taxId}
              onChange={(e): void => setTaxId(e.target.value)}
              onFocus={openRegisterModal}
            />
            <button
              className="usa-button usa-button--unstyled position-absolute"
              style={{ right: "1rem", top: "50%", transform: "translateY(-50%)" }}
              onClick={(): void => setShowTaxId(!showTaxId)}
              type="button"
            >
              <span role="img" aria-label={showTaxId ? "Hide" : "Show"}>
                <Icon iconName={showTaxId ? "visibility_off" : "visibility"} />
              </span>{" "}
              {showTaxId ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="display-flex flex-justify-center">
          <PrimaryButton
            isColor="primary"
            onClick={handleTaxLookupSubmit}
            isRightMarginRemoved={false}
            isLoading={isSubmitting}
          >
            {isSubmitting ? "Accessing..." : "Access My Calendar"}
          </PrimaryButton>
        </div>
      </div>
    );
  };

  return getWidgetComponent();
};
