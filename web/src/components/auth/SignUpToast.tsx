import { Content } from "@/components/Content";
import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { Icon } from "@/components/njwds/Icon";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useRoadmapSidebarCards } from "@/lib/data-hooks/useRoadmapSidebarCards";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { MediaQueries } from "@/lib/PageSizes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { AuthAlertContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { IconButton, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

export const SignUpToast = (): ReactElement => {
  const { userData, update } = useUserData();
  const { showCard } = useRoadmapSidebarCards();
  const { isAuthenticated, alertIsVisible, setAlertIsVisible, setRegistrationAlertStatus } =
    useContext(AuthAlertContext);
  const router = useRouter();
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  useMountEffectWhenDefined(() => {
    if (isAuthenticated == IsAuthenticated.TRUE) {
      setAlertIsVisible(false);
    }
  }, isAuthenticated);

  if (isAuthenticated == IsAuthenticated.TRUE) {
    return <></>;
  }

  const handleClose = async () => {
    setAlertIsVisible(false);
    await showCard("not-registered");
  };

  return (
    <ToastAlert
      isOpen={alertIsVisible}
      close={() => setAlertIsVisible(false)}
      variant="info"
      noIcon={true}
      autoHideDuration={null}
      className={"bg-base-lightest"}
      snackBarProps={{ sx: { paddingX: 0 } }}
      dataTestid="self-reg-toast"
    >
      <div className="fin fac padding-y-2">
        {isDesktopAndUp ? (
          <img
            src={`/img/Group.svg`}
            alt="registration"
            style={{ marginRight: "20px", width: "51px", height: "64px" }}
          />
        ) : (
          <></>
        )}
        <div>
          <Content className="padding-right-2">{Config.navigationDefaults.guestAlertTitle}</Content>
          <IconButton
            aria-label="close"
            onClick={handleClose}
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
            className="padding-top-105"
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
