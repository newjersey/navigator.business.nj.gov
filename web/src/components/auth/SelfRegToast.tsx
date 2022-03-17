import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import analytics from "@/lib/utils/analytics";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared";
import { IconButton } from "@mui/material";
import React, { ReactElement, useContext, useEffect } from "react";

export const SelfRegToast = (): ReactElement => {
  const { isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);

  useEffect(() => {
    if (registrationAlertStatus == "IN_PROGRESS" && isAuthenticated == IsAuthenticated.TRUE) {
      analytics.event.roadmap_dashboard.arrive.arrive_from_myNJ_registration();
      setRegistrationAlertStatus("SUCCESS");
    }
  }, [isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus]);

  type AlertStatus = Exclude<RegistrationStatus, "IN_PROGRESS">;
  const alertMap: Record<AlertStatus, AlertVariant> = {
    SUCCESS: "success",
    DUPLICATE_ERROR: "error",
    RESPONSE_ERROR: "error",
  };

  const contentMap: Record<AlertStatus, string> = {
    SUCCESS: Config.navigationDefaults.guestSuccessBody,
    DUPLICATE_ERROR: Config.selfRegistration.errorTextDuplicateSignup,
    RESPONSE_ERROR: Config.selfRegistration.errorTextGeneric,
  };

  if (!registrationAlertStatus || registrationAlertStatus === "IN_PROGRESS") return <></>;

  return (
    <ToastAlert
      isOpen={!!registrationAlertStatus}
      close={() => setRegistrationAlertStatus(undefined)}
      variant={alertMap[registrationAlertStatus]}
      noIcon={true}
      autoHideDuration={null}
      snackBarProps={{ sx: { paddingX: 0 } }}
    >
      <div className="fin fac padding-y-2 padding-right-3" data-testid={"reg-toast"}>
        {alertMap[registrationAlertStatus] == "success" ? (
          <img
            src={`/img/congratulations-green.svg`}
            alt="congratulations"
            data-testid={"congratulations-logo"}
            style={{ marginRight: "20px", width: "64px", height: "64px" }}
          />
        ) : (
          <></>
        )}
        <div>
          {alertMap[registrationAlertStatus] == "success" ? (
            <Content className="padding-right-2">{Config.navigationDefaults.guestSuccessTitle}</Content>
          ) : (
            <></>
          )}
          <IconButton
            aria-label="close"
            onClick={() => setRegistrationAlertStatus(undefined)}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
          <Content>{contentMap[registrationAlertStatus]}</Content>
        </div>
      </div>
    </ToastAlert>
  );
};
