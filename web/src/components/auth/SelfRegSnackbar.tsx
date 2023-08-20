import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { IconButton } from "@mui/material";
import { ReactElement, useContext, useEffect } from "react";

export const SelfRegSnackbar = (): ReactElement => {
  const { isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);

  useEffect(() => {
    if (registrationAlertStatus === "IN_PROGRESS" && isAuthenticated === IsAuthenticated.TRUE) {
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
    DUPLICATE_ERROR: Config.selfRegistration.errorTextDuplicateSignUp,
    RESPONSE_ERROR: Config.selfRegistration.errorTextGeneric,
  };

  if (!registrationAlertStatus || registrationAlertStatus === "IN_PROGRESS") {
    return <></>;
  }

  return (
    <SnackbarAlert
      isOpen={!!registrationAlertStatus}
      close={(): void => setRegistrationAlertStatus(undefined)}
      variant={alertMap[registrationAlertStatus]}
      noIcon={true}
      autoHideDuration={null}
      snackBarProps={{ sx: { paddingX: 0 } }}
      dataTestid="reg-snackbar"
    >
      <div className="fin fac padding-y-2 padding-right-3">
        {alertMap[registrationAlertStatus] === "success" ? (
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
          {alertMap[registrationAlertStatus] === "success" ? (
            <Content className="padding-right-2">{Config.navigationDefaults.guestSuccessTitle}</Content>
          ) : (
            <></>
          )}
          <IconButton
            aria-label="close"
            onClick={(): void => setRegistrationAlertStatus(undefined)}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: "#757575",
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
          <Content>{contentMap[registrationAlertStatus]}</Content>
        </div>
      </div>
    </SnackbarAlert>
  );
};
