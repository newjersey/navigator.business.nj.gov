import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { postTaxRegistrationLookup } from "@/lib/api-client/apiClient";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { checkQueryValue, QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import {
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  UserData,
} from "@businessnjgovnavigator/shared/";
import { getCurrentDate, parseDate } from "@businessnjgovnavigator/shared/index";
import { useRouter } from "next/router";

import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { useMountEffectWhenDefined } from "../lib/utils/helpers";
import { Button } from "./njwds-extended/Button";
import { TaxFilingLookupModal } from "./TaxFilingLookupModal";

export const shouldRenderFilingsCalendarTaxAccess = (userData?: UserData) => {
  return (
    userData &&
    LookupOperatingPhaseById(userData.profileData.operatingPhase).displayTaxAccessButton &&
    LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling &&
    process.env.FEATURE_BUSINESS_FLC == "true"
  );
};

const isBeforeTheFollowingSaturday = (registeredISO: string | undefined) => {
  const sundayAfterRegisteredDate = parseDate(registeredISO).day(7);
  return getCurrentDate().isBefore(sundayAfterRegisteredDate);
};

export const FilingsCalendarTaxAccess = (): ReactElement => {
  const { userData, update } = useUserData();
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
    (async () => {
      if (userData.taxFilingData.registeredISO) {
        const updatedUserData = await postTaxRegistrationLookup({
          businessName: userData.taxFilingData.businessName as string,
          taxId: userData.profileData.taxId as string,
        });
        update(updatedUserData);
      }
    })();
  }, userData);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (checkQueryValue(router, QUERIES.openTaxFilingsModal, "true")) {
      router.replace({ pathname: ROUTES.dashboard }, undefined, { shallow: true });
      setShowTaxModal(true);
    }
  }, [router, router.isReady]);

  useEffect(() => {
    if (!userData) {
      return;
    }
    if (registrationModalIsVisible === false && prevModalIsVisible.current === true) {
      update({ ...userData, preferences: { ...userData.preferences, returnToLink: "" } });
    }
    prevModalIsVisible.current = registrationModalIsVisible;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrationModalIsVisible]);

  const openRegisterOrTaxModal = () => {
    if (!userData) {
      return;
    }
    if (isAuthenticated === IsAuthenticated.FALSE) {
      update({
        ...userData,
        preferences: {
          ...userData.preferences,
          returnToLink: `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`,
        },
      });
      analytics.event.tax_calendar_banner_button.click.show_myNJ_registration_prompt_modal();
      setRegistrationModalIsVisible(true);
    } else {
      analytics.event.tax_calendar_banner_button.click.show_tax_calendar_modal();
      setShowTaxModal(true);
    }
  };

  const getWidgetComponent = (): ReactElement => {
    if (userData?.taxFilingData.registeredISO) {
      if (userData?.taxFilingData.state == "PENDING") {
        return (
          <div className="tax-calendar-upper-widget-container" data-testid="pending-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.PendingCopyMarkdown}</Content>
            </div>
          </div>
        );
      } else if (isBeforeTheFollowingSaturday(userData.taxFilingData.registeredISO)) {
        return (
          <div className="tax-calendar-upper-widget-container" data-testid="alert-content-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
              <Content>{Config.taxCalendar.RegistrationFollowUpCopyMarkdown}</Content>
            </div>
          </div>
        );
      }
    } else {
      return (
        <>
          <TaxFilingLookupModal
            isOpen={showTaxModal}
            close={() => {
              return setShowTaxModal(false);
            }}
            onSuccess={async () => {
              setShowTaxModal(false);
              await new Promise((resolve) => {
                return setTimeout(resolve, 500);
              });
              setShowAlert(true);
            }}
          />
          <div className="tax-calendar-upper-widget-container grid-row" data-testid="button-container">
            <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2 mobile-lg:grid-col-6 grid-col-12">
              <Content>{Config.taxCalendar.AccessBody}</Content>
            </div>
            <Button
              dataTestid="get-tax-access"
              style={"secondary"}
              noRightMargin
              onClick={openRegisterOrTaxModal}
            >
              {Config.taxCalendar.AccessButton}
            </Button>
          </div>
        </>
      );
    }
    return <></>;
  };
  return (
    <>
      <SnackbarAlert
        variant={"success"}
        isOpen={showAlert}
        close={() => {
          return setShowAlert(false);
        }}
        heading={Config.taxCalendar.SnackbarSuccessHeader}
        dataTestid={"tax-success"}
      >
        <Content>{Config.taxCalendar.SnackbarSuccessBody}</Content>
      </SnackbarAlert>
      {getWidgetComponent()}
    </>
  );
};
