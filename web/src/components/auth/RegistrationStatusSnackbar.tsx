import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { Heading } from "@/components/njwds-extended/Heading";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { IconButton } from "@mui/material";
import { ReactElement, useContext, useEffect } from "react";

export const RegistrationStatusSnackbar = (): ReactElement<any> => {
  const { isAuthenticated, registrationStatus, setRegistrationStatus } = useContext(NeedsAccountContext);
  const { state } = useContext(AuthContext);
  const { Config } = useConfig();

  useEffect(() => {
    if (registrationStatus === "IN_PROGRESS" && isAuthenticated === IsAuthenticated.TRUE) {
      analytics.event.roadmap_dashboard.arrive.arrive_from_myNJ_registration();
      setRegistrationStatus("SUCCESS");
    }
  }, [isAuthenticated, registrationStatus, setRegistrationStatus]);

  type AlertStatus = Exclude<RegistrationStatus, "IN_PROGRESS">;
  const alertMap: Record<AlertStatus, AlertVariant> = {
    SUCCESS: "success",
    DUPLICATE_ERROR: "error",
    RESPONSE_ERROR: "error",
  };

  const contentMap: Record<AlertStatus, string> = {
    SUCCESS: Config.selfRegistration.accountSuccessSnackbarBody,
    DUPLICATE_ERROR: Config.selfRegistration.errorTextDuplicateSignUp,
    RESPONSE_ERROR: Config.selfRegistration.errorTextGeneric,
  };

  const getSuccessTitle = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.selfRegistration.accountSuccessSnackbarTitleExistingAccount
      : Config.selfRegistration.accountSuccessSnackbarTitle;
  };

  if (!registrationStatus || registrationStatus === "IN_PROGRESS") {
    return <></>;
  }

  if (alertMap[registrationStatus] === "success") {
    return (
      <SnackbarAlert
        isOpen={!!registrationStatus}
        close={(): void => setRegistrationStatus(undefined)}
        variant={alertMap[registrationStatus]}
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
            <Heading level={3} className="padding-right-2">
              {getSuccessTitle()}
            </Heading>
            <IconButton
              aria-label="close"
              onClick={(): void => setRegistrationStatus(undefined)}
              sx={{
                position: "absolute",
                right: 0,
                top: 0,
                color: "#757575",
              }}
            >
              <Icon className="usa-icon--size-4" iconName="close" />
            </IconButton>
            <Content>{contentMap[registrationStatus]}</Content>
          </div>
        </div>
      </SnackbarAlert>
    );
  }
  return (
    <SnackbarAlert
      isOpen={!!registrationStatus}
      close={(): void => setRegistrationStatus(undefined)}
      closeIcon={true}
      variant={alertMap[registrationStatus]}
      autoHideDuration={null}
      dataTestid="reg-snackbar"
      heading={Config.profileDefaults.default.errorTextHeader}
    >
      <Content>{contentMap[registrationStatus]}</Content>
    </SnackbarAlert>
  );
};
