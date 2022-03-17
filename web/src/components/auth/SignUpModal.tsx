import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, ReactNode, useContext } from "react";

export const SignUpModalWrapper = (props: { children: ReactNode }): ReactElement => {
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

export const SignUpModal = (): ReactElement => {
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
    <Dialog
      open={modalIsVisible}
      maxWidth="xs"
      onClose={() => setModalIsVisible(false)}
      data-testid={"self-reg-modal"}
    >
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
