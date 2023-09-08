import { Content } from "@/components/Content";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { MediaQueries } from "@/lib/PageSizes";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { IconButton, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const SignUpSnackbar = (): ReactElement => {
  const { showCard } = useSidebarCards();
  const { showNeedsAccountSnackbar, setShowNeedsAccountSnackbar } = useContext(NeedsAccountContext);
  const { state } = useContext(AuthContext);
  const isDesktopAndUp = useMediaQuery(MediaQueries.desktopAndUp);

  if (!showNeedsAccountSnackbar) {
    return <></>;
  }

  const handleClose = async (): Promise<void> => {
    setShowNeedsAccountSnackbar(false);
    if (state.activeUser?.encounteredMyNjLinkingError) {
      await showCard("not-registered-existing-account");
    } else {
      await showCard("not-registered");
    }
  };

  const getTitle = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.navigationDefaults.guestAlertTitleExistingAccount
      : Config.navigationDefaults.guestAlertTitle;
  };

  const getBody = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.navigationDefaults.guestAlertBodyExistingAccount
      : Config.navigationDefaults.guestAlertBody;
  };

  return (
    <SnackbarAlert
      isOpen={showNeedsAccountSnackbar}
      close={(): void => setShowNeedsAccountSnackbar(false)}
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
          <h3 className="padding-right-2">{getTitle()}</h3>
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
          <Content>{getBody()}</Content>
        </div>
      </div>
    </SnackbarAlert>
  );
};
