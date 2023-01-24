import { Content } from "@/components/Content";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Box, Dialog, DialogContent, DialogTitle, IconButton } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export const SignUpModal = (): ReactElement => {
  const { userData, update } = useUserData();
  const router = useRouter();
  const {
    isAuthenticated,
    registrationModalIsVisible,
    setRegistrationModalIsVisible,
    setRegistrationAlertStatus,
  } = useContext(AuthAlertContext);

  useMountEffectWhenDefined(() => {
    if (isAuthenticated == IsAuthenticated.TRUE) {
      setRegistrationModalIsVisible(false);
    }
  }, isAuthenticated);

  if (isAuthenticated == IsAuthenticated.TRUE) {
    return <></>;
  }

  const selfRegister = () => {
    if (userData?.preferences.returnToLink === `${ROUTES.dashboard}?${QUERIES.openTaxFilingsModal}=true`) {
      analytics.event.myNJ_prompt_modal_complete_button.click.go_to_myNJ_registration();
      onSelfRegister(router, userData, update, setRegistrationAlertStatus, true);
    } else {
      analytics.event.guest_modal.click.go_to_myNJ_registration();
      onSelfRegister(router, userData, update, setRegistrationAlertStatus);
    }
  };

  return (
    <Dialog
      open={registrationModalIsVisible}
      maxWidth="xs"
      onClose={() => {
        return setRegistrationModalIsVisible(false);
      }}
      data-testid={"self-reg-modal"}
    >
      <DialogTitle sx={{ p: 5, paddingRight: 10 }}>
        <Content>{Config.navigationDefaults.guestModalTitle}</Content>
        <IconButton
          aria-label="close"
          onClick={() => {
            return setRegistrationModalIsVisible(false);
          }}
          sx={{
            position: "absolute",
            right: 10,
            top: 12,
            color: "#757575",
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
          <Button style="primary" className="width-100" onClick={selfRegister}>
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
