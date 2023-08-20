import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { IconButton, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const SignUpSnackbar = (): ReactElement => {
  const { showCard } = useSidebarCards();
  const { registrationAlertIsVisible, setRegistrationAlertIsVisible } = useContext(AuthAlertContext);
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  if (!registrationAlertIsVisible) {
    return <></>;
  }

  const handleClose = async (): Promise<void> => {
    setRegistrationAlertIsVisible(false);
    await showCard("not-registered");
  };

  return (
    <SnackbarAlert
      isOpen={registrationAlertIsVisible}
      close={(): void => setRegistrationAlertIsVisible(false)}
      variant="info"
      noIcon={true}
      autoHideDuration={null}
      className={"bg-base-lightest"}
      snackBarProps={{ sx: { paddingX: 0 } }}
      dataTestid="self-reg-snackbar"
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
              color: "#757575",
            }}
          >
            <Icon className="usa-icon--size-4">close</Icon>
          </IconButton>
          <Content className="padding-top-105">{Config.navigationDefaults.guestAlertBody}</Content>
        </div>
      </div>
    </SnackbarAlert>
  );
};
