import { Content } from "@/components/Content";
import { Heading } from "@/components/njwds-extended/Heading";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { Icon } from "@/components/njwds/Icon";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useSidebarCards } from "@/lib/data-hooks/useSidebarCards";
import { MediaQueries } from "@/lib/PageSizes";
import { SIDEBAR_CARDS } from "@businessnjgovnavigator/shared/domain-logic/sidebarCards";
import { IconButton, useMediaQuery } from "@mui/material";
import { ReactElement, useContext } from "react";

export const NeedsAccountSnackbar = (): ReactElement => {
  const { Config } = useConfig();
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
      await showCard(SIDEBAR_CARDS.notRegisteredExistingAccount);
    } else {
      await showCard(SIDEBAR_CARDS.notRegistered);
    }
  };

  const getTitle = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.navigationDefaults.needsAccountSnackbarTitleExistingAccount
      : Config.navigationDefaults.needsAccountSnackbarTitle;
  };

  const getBody = (): string => {
    return state.activeUser?.encounteredMyNjLinkingError
      ? Config.navigationDefaults.needsAccountSnackbarBodyExistingAccount
      : Config.navigationDefaults.needsAccountSnackbarBody;
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
            src={`/img/needs-account-snackbar-icon.svg`}
            alt="registration"
            style={{ marginRight: "20px", width: "51px", height: "64px" }}
          />
        ) : (
          <></>
        )}
        <div>
          <Heading level={3} className="padding-right-2">
            {getTitle()}
          </Heading>
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
