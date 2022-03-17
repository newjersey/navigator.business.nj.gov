import { Content } from "@/components/Content";
import { AlertVariant } from "@/components/njwds-extended/Alert";
import { Button } from "@/components/njwds-extended/Button";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { RegistrationStatus } from "@businessnjgovnavigator/shared";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, ReactNode, useContext, useEffect } from "react";

export const SelfRegToast = (): ReactElement => {
  const { isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);

  useEffect(() => {
    if (registrationAlertStatus == "IN_PROGRESS" && isAuthenticated == IsAuthenticated.TRUE) {
      analytics.event.roadmap_dashboard.arrive.arrive_from_myNJ_registration();
      setRegistrationAlertStatus("SUCCESS");
    }
  }, [isAuthenticated, registrationAlertStatus, setRegistrationAlertStatus]);

  const alertMap: Record<Exclude<RegistrationStatus, "IN_PROGRESS">, AlertVariant> = {
    SUCCESS: "success",
    DUPLICATE_ERROR: "error",
    RESPONSE_ERROR: "error",
  };

  const contentMap: Record<Exclude<RegistrationStatus, "IN_PROGRESS">, string> = {
    SUCCESS: Config.navigationDefaults.guestSuccessBody,
    DUPLICATE_ERROR: Config.selfRegistration.errorTextDuplicateSignup,
    RESPONSE_ERROR: Config.selfRegistration.errorTextGeneric,
  };

  if (registrationAlertStatus && registrationAlertStatus != "IN_PROGRESS") {
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
  }
  return <></>;
};
export const UseAuthToast = (): ReactElement => {
  const { userData, update } = useUserData();
  const { isAuthenticated, alertIsVisible, setAlertIsVisible, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);
  const router = useRouter();

  useMountEffectWhenDefined(() => {
    if (isAuthenticated == IsAuthenticated.TRUE) {
      setAlertIsVisible(false);
    }
  }, isAuthenticated);

  if (isAuthenticated == IsAuthenticated.TRUE) {
    return <></>;
  }

  return (
    <ToastAlert
      isOpen={alertIsVisible}
      close={() => setAlertIsVisible(false)}
      variant="info"
      noIcon={true}
      autoHideDuration={null}
      snackBarProps={{ sx: { paddingX: 0 } }}
    >
      <div className="fin fac padding-y-2" data-testid={"self-reg-toast"}>
        <img
          src={`/img/Group.svg`}
          alt="section"
          style={{ marginRight: "20px", width: "51px", height: "64px" }}
        />
        <div>
          <Content className="padding-right-2">{Config.navigationDefaults.guestAlertTitle}</Content>
          <IconButton
            aria-label="close"
            onClick={() => setAlertIsVisible(false)}
            sx={{
              position: "absolute",
              right: 0,
              top: 0,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
          <Content
            onClick={() => {
              analytics.event.guest_toast.click.go_to_myNJ_registration();
              onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
            }}
          >
            {Config.navigationDefaults.guestAlertBody}
          </Content>
        </div>
      </div>
    </ToastAlert>
  );
};

export const UseAuthModalWrapper = (props: { children: ReactNode }): ReactElement => {
  const { isAuthenticated, setModalIsVisible } = useContext(AuthAlertContext);
  useMountEffectWhenDefined(() => {
    if (isAuthenticated != IsAuthenticated.TRUE) {
      setModalIsVisible(true);
    }
  }, isAuthenticated);

  if (isAuthenticated != IsAuthenticated.TRUE) {
    return (
      <div className="disabled-overlay">
        <div className="cursor-wrapper">{props.children}</div>
      </div>
    );
  }
  return <>{props.children}</>;
};

export const UseAuthModal = (): ReactElement => {
  const { userData, update } = useUserData();
  const router = useRouter();
  const { isAuthenticated, modalIsVisible, setModalIsVisible, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);

  useMountEffectWhenDefined(() => {
    if (isAuthenticated == IsAuthenticated.TRUE) {
      setModalIsVisible(false);
    }
  }, isAuthenticated);

  if (isAuthenticated == IsAuthenticated.TRUE) {
    return <></>;
  }

  return (
    <Dialog open={modalIsVisible} maxWidth="xs" onClose={() => undefined} data-testid={"self-reg-modal"}>
      <DialogTitle sx={{ p: 5, paddingRight: 10 }}>
        <Content>{Config.navigationDefaults.guestModalTitle}</Content>
        <IconButton
          aria-label="close"
          onClick={() => setModalIsVisible(false)}
          sx={{
            position: "absolute",
            right: 10,
            top: 12,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Icon className="usa-icon--size-4">close</Icon>
        </IconButton>
      </DialogTitle>

      <DialogContent dividers={false} sx={{ paddingX: 5, paddingBottom: 3 }}>
        <Content>{Config.navigationDefaults.guestModalBody}</Content>
      </DialogContent>
      <DialogContent dividers={false} sx={{ paddingX: 5 }}>
        <Box>
          <Button
            style="primary"
            className="width-100"
            onClick={() => {
              analytics.event.guest_modal.click.go_to_myNJ_registration();
              onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
            }}
          >
            {Config.navigationDefaults.guestModalButtonText}
          </Button>
        </Box>
      </DialogContent>

      <DialogContent dividers={true} sx={{ paddingX: 5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            marginX: "auto",
            width: "fit-content",
            marginY: 1,
          }}
        >
          <Content
            onClick={() => {
              analytics.event.guest_modal.click.go_to_myNJ_login();

              triggerSignIn();
            }}
          >
            {Config.navigationDefaults.guestModalSubText}
          </Content>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
