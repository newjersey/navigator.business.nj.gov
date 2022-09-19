import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { postTaxRegistrationOnboarding } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { LookupLegalStructureById, LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/";

import { ReactElement, useState } from "react";
import { useMountEffectWhenDefined } from "../lib/utils/helpers";
import { Gov2GoModal } from "./Gov2GoModal";
import { Button } from "./njwds-extended/Button";

export const FilingsCalendarTaxAccess = (): ReactElement => {
  const { userData, update } = useUserData();
  const { Config } = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    (async () => {
      if (userData.taxFilingData.state == "PENDING") {
        const updatedUserData = await postTaxRegistrationOnboarding({
          businessName: userData.taxFilingData.businessName as string,
          taxId: userData.profileData.taxId as string,
        });
        update(updatedUserData);
      }
    })();
  }, userData);

  const getBody = () => {
    if (userData?.taxFilingData.state == "PENDING") {
      return (
        <div className="tax-calendar-button-container" data-testid="pending-container">
          <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
            <Content>{Config.dashboardDefaults.taxCalendarPendingCopyMarkdown}</Content>
          </div>
        </div>
      );
    }
    return LookupOperatingPhaseById(userData?.profileData.operatingPhase).displayTaxAccessButton &&
      LookupLegalStructureById(userData?.profileData.legalStructureId).requiresPublicFiling &&
      userData?.taxFilingData.state !== "SUCCESS" ? (
      <>
        <Gov2GoModal
          isOpen={showModal}
          close={() => setShowModal(false)}
          onSuccess={async () => {
            setShowModal(false);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setShowAlert(true);
          }}
        />
        <div className="tax-calendar-button-container grid-row" data-testid="button-container">
          <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2 mobile-lg:grid-col-6 grid-col-12">
            <Content>{Config.dashboardDefaults.taxCalendarAccessBody}</Content>
          </div>
          <Button
            dataTestid="get-tax-access"
            style={"secondary"}
            noRightMargin
            onClick={() => {
              analytics.event.tax_calendar_banner_button.click.show_tax_calendar_modal();
              setShowModal(true);
            }}
          >
            {Config.dashboardDefaults.taxCalendarAccessButton}
          </Button>
        </div>
      </>
    ) : (
      <></>
    );
  };
  return (
    <>
      {process.env.FEATURE_TAX_CALENDAR == "true" ? (
        <>
          <SnackbarAlert
            variant={"success"}
            isOpen={showAlert}
            close={() => setShowAlert(false)}
            heading={Config.dashboardDefaults.taxCalendarSnackbarSuccessHeader}
            dataTestid={"tax-success"}
          >
            <Content>{Config.dashboardDefaults.taxCalendarSnackbarSuccessBody}</Content>
          </SnackbarAlert>
          {getBody()}
        </>
      ) : (
        <></>
      )}
    </>
  );
};
