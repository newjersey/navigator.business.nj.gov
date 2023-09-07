import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { IconButton } from "@mui/material";
import { ReactElement, useContext, useEffect } from "react";

export const SelfRegSnackbar = (): ReactElement => {
  const { isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);
  const { state } = useContext(AuthContext);
  const { Config } = useConfig();

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

  const getSuccessTitle = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.navigationDefaults.guestSuccessTitleExistingAccount
      : Config.navigationDefaults.guestSuccessTitle;
  };

  if (!registrationAlertStatus || registrationAlertStatus === "IN_PROGRESS") {
    return <></>;
  }

  if (alertMap[registrationAlertStatus] === "success") {
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
        <div className={"fin fac padding-y-2 padding-right-3"}>
          <img
            src={`/img/congratulations-green.svg`}
            alt="congratulations"
            data-testid={"congratulations-logo"}
            style={{ marginRight: "20px", width: "64px", height: "64px" }}
          />
          <div>
            <h3 className="padding-right-2">{getSuccessTitle()}</h3>
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
              <Icon className={"usa-icon--size-4"}>close</Icon>
            </IconButton>
            <Content>{contentMap[registrationAlertStatus]}</Content>
          </div>
        </div>
      </SnackbarAlert>
    );
  }
  return (
    <SnackbarAlert
      isOpen={!!registrationAlertStatus}
      close={(): void => setRegistrationAlertStatus(undefined)}
      closeIcon={true}
      variant={alertMap[registrationAlertStatus]}
      autoHideDuration={null}
      dataTestid="reg-snackbar"
      heading={Config.profileDefaults.default.errorTextHeader}
    >
      <Content>{contentMap[registrationAlertStatus]}</Content>
    </SnackbarAlert>
  );
};
