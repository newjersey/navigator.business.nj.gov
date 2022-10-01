import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { postTaxRegistrationLookup } from "@/lib/api-client/apiClient";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import {
  LookupLegalStructureById,
  LookupOperatingPhaseById,
  UserData,
} from "@businessnjgovnavigator/shared/";

import { ReactElement, useState } from "react";
import { useMountEffectWhenDefined } from "../lib/utils/helpers";
import { Button } from "./njwds-extended/Button";
import { TaxFilingLookupModal } from "./TaxFilingLookupModal";

export const shouldRenderFilingsCalendarTaxAccess = (userData?: UserData) =>
  userData &&
  LookupOperatingPhaseById(userData.profileData.operatingPhase).displayTaxAccessButton &&
  LookupLegalStructureById(userData.profileData.legalStructureId).requiresPublicFiling &&
  process.env.FEATURE_TAX_CALENDAR == "true";

export const FilingsCalendarTaxAccess = (): ReactElement => {
  const { userData, update } = useUserData();
  const { Config } = useConfig();
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    (async () => {
      if (userData.taxFilingData.registered) {
        const updatedUserData = await postTaxRegistrationLookup({
          businessName: userData.taxFilingData.businessName as string,
          taxId: userData.profileData.taxId as string,
        });
        update(updatedUserData);
      }
    })();
  }, userData);

  return (
    <>
      <SnackbarAlert
        variant={"success"}
        isOpen={showAlert}
        close={() => setShowAlert(false)}
        heading={Config.taxCalendar.SnackbarSuccessHeader}
        dataTestid={"tax-success"}
      >
        <Content>{Config.taxCalendar.SnackbarSuccessBody}</Content>
      </SnackbarAlert>
      {userData?.taxFilingData.state == "PENDING" ? (
        <div className="tax-calendar-button-container" data-testid="pending-container">
          <div className="margin-bottom-2 tablet:margin-bottom-0 margin-right-2">
            <Content>{Config.taxCalendar.PendingCopyMarkdown}</Content>
          </div>
        </div>
      ) : (
        userData?.taxFilingData.state != "SUCCESS" &&
        !userData?.taxFilingData.registered && (
          <>
            <TaxFilingLookupModal
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
                <Content>{Config.taxCalendar.AccessBody}</Content>
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
                {Config.taxCalendar.AccessButton}
              </Button>
            </div>
          </>
        )
      )}
    </>
  );
};
