import { Content } from "@/components/Content";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { IconButton } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

export const SignUpToast = (): ReactElement => {
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
