import { Content } from "@/components/Content";
import { TaxAccessModal } from "@/components/filings-calendar/tax-access-modal/TaxAccessModal";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { postTaxFilingsLookup } from "@/lib/api-client/apiClient";
import { fetchMunicipalityByName } from "@/lib/async-content-fetchers/fetchMunicipalities";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/index";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect, useRef, useState } from "react";

const isBeforeTheFollowingSaturday = (registeredISO: string | undefined): boolean => {
  const sundayAfterRegisteredDate = parseDate(registeredISO).day(7);
  return getCurrentDate().isBefore(sundayAfterRegisteredDate);
};

export const FilingsCalendarTaxAccess = (): ReactElement => {
  const { updateQueue, userData } = useUserData();
  const { Config } = useConfig();
  const { isAuthenticated, setRegistrationModalIsVisible, registrationModalIsVisible } =
    useContext(AuthAlertContext);
  const [showTaxModal, setShowTaxModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const router = useRouter();
  const prevModalIsVisible = useRef<boolean | undefined>(undefined);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    (async (): Promise<void> => {
      if (userData.taxFilingData.registeredISO) {
        const updatedUserData = await postTaxFilingsLookup({
          businessName: userData.taxFilingData.businessName as string,
          taxId: userData.profileData.taxId as string,
          encryptedTaxId: userData.profileData.encryptedTaxId as string,
        });

        let record;

        if (updatedUserData.profileData.municipality?.name) {
          record = await fetchMunicipalityByName(updatedUserData.profileData.municipality?.name || "");
        }

        const municipalityToSet = {
          name: record?.townName || userData.profileData.municipality?.name || "",
          county: record?.countyName || userData.profileData.municipality?.county || "",
          id: record?.id || userData.profileData.municipality?.id || "",
          displayName: record?.townDisplayName || userData.profileData.municipality?.displayName || "",
        };

        updateQueue?.queue(updatedUserData).queueProfileData({ municipality: municipalityToSet }).update();
      }
    })();
  }, userData);

  useEffect(() => {
    if (!router || !router.isReady) {
      return;
    }
    if (checkQueryValue(router, QUERIES.openTaxFilingsModal, "true")) {
      router.replace({ pathname: ROUTES.dashboard }, undefined, { shallow: true });
      setShowTaxModal(true);
    }
  }, [router]);

  useEffect(() => {
    if (!userData) {
      return;
    }
    if (!registrationModalIsVisible && prevModalIsVisible.current === true) {
      updateQueue?.queuePreferences({ returnToLink: "" }).update();
    }
    prevModalIsVisible.current = registrationModalIsVisible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationModalIsVisible]);

  const openRegisterOrTaxModal = (): void => {
    if (!userData) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      updateQueue
        ?.queuePreferences({ returnToLink: `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true` })
        .update();
      analytics.event.tax_calendar_banner_button.click.show_myNJ_registration_prompt_modal();
      setRegistrationModalIsVisible(true);
    } else {
      analytics.event.tax_calendar_banner_button.click.show_tax_calendar_modal();
      setShowTaxModal(true);
    }
  };

  const getWidgetComponent = (): ReactElement => {
    if (userData?.taxFilingData.registeredISO) {
      if (userData?.taxFilingData.state === "PENDING") {
        return (
          <div className="tax-calendar-upper-widget-container" data-testid="pending-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.pendingCopyMarkdown}</Content>
            </div>
          </div>
        );
      } else if (isBeforeTheFollowingSaturday(userData.taxFilingData.registeredISO)) {
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
    } else {
      return (
        <>
          <TaxAccessModal
            isOpen={showTaxModal}
            close={(): void => setShowTaxModal(false)}
            onSuccess={(): void => {
              setShowTaxModal(false);
              setTimeout(() => {
                setShowAlert(true);
              }, 500);
            }}
          />
          <div
            className="tax-calendar-upper-widget-container border-primary-light grid-row"
            data-testid="button-container"
          >
            <div className="margin-bottom-2 mobile-lg:margin-bottom-0 margin-right-1 mobile-lg:grid-col-6 grid-col-12">
              <Content>{Config.taxCalendar.accessBody}</Content>
            </div>
            <PrimaryButton
              isColor="primary"
              dataTestId="get-tax-access"
              isRightMarginRemoved={true}
              onClick={openRegisterOrTaxModal}
            >
              {Config.taxCalendar.accessButton}
            </PrimaryButton>
          </div>
        </>
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
