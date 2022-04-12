import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister, onSignOut } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { AuthAlertContext, AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  isWidePage?: boolean;
};

export const NavBarDesktop = (props: Props): ReactElement => {
  const { userData, update } = useUserData();
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const userName = getUserNameOrEmail(userData);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const toggleDropdown = (): void => {
    if (!open) {
      analytics.event.account_name.click.expand_account_menu();
    }
    setOpen((prevOpen) => !prevOpen);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>): void => {
    analytics.event.account_menu_myNJ_account.click.go_to_myNJ_home();
    window.open(process.env.MYNJ_PROFILE_LINK || "", "_ blank");
    handleClose(event);
  };

  const handleLogoutClick = (event: React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>): void => {
    onSignOut(router.push, dispatch);
    handleClose(event);
  };

  const handleClose = (
    event: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
    if (anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }

    setOpen(false);
  };

  function handleListKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Tab") {
      event.preventDefault();
      setOpen(false);
    }
  }

  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const redirectUrl = useMemo(
    () => (userData?.profileData.hasExistingBusiness ? "/dashboard" : "/roadmap"),
    [userData?.profileData.hasExistingBusiness]
  );

  const isAuthenticated = useMemo(() => state.isAuthenticated == "TRUE", [state.isAuthenticated]);
  const textColor = isAuthenticated ? "primary" : "base";
  const accountIcon = isAuthenticated ? "account_circle" : "help";
  const accountString = isAuthenticated ? userName : Config.navigationDefaults.navBarGuestText;

  const UnAuthenticatedMenu = () => (
    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
      <MenuItem
        onClick={() => {
          analytics.event.account_menu_my_profile.click.go_to_profile_screen();
          router.push("/profile");
        }}
      >
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.profileLinkText}
        </Button>
      </MenuItem>
      <MenuItem
        onClick={() => {
          analytics.event.guest_menu.click.go_to_myNJ_registration();
          onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
        }}
      >
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.navBarGuestRegistrationText}
        </Button>
      </MenuItem>
      <MenuItem
        onClick={() => {
          analytics.event.guest_menu.click.go_to_myNJ_registration();
          triggerSignIn();
        }}
        data-testid="login-button"
      >
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.logInButton}
        </Button>
      </MenuItem>
    </MenuList>
  );

  const AuthenticatedMenu = () => (
    <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown}>
      <MenuItem onClick={handleProfileClick}>
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.myNJAccountText}
        </Button>
      </MenuItem>
      <MenuItem
        onClick={() => {
          analytics.event.account_menu_my_profile.click.go_to_profile_screen();
          router.push("/profile");
        }}
      >
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.profileLinkText}
        </Button>
      </MenuItem>
      <MenuItem onClick={handleLogoutClick}>
        <Button style="tertiary" textBold smallText>
          {Config.navigationDefaults.logoutButton}
        </Button>
      </MenuItem>
    </MenuList>
  );
  return (
    <nav
      aria-label="Primary"
      className={props.isWidePage ? "grid-container-widescreen desktop:padding-x-7" : "grid-container"}
    >
      <div className="display-flex flex-row flex-justify flex-align-center height-8">
        <Link href={redirectUrl} passHref>
          <a href={redirectUrl}>
            <img className="height-4" src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
          </a>
        </Link>
        <div className="z-100">
          <button
            className="clear-button"
            ref={anchorRef}
            aria-controls={open ? "menu-list-grow" : undefined}
            aria-haspopup="true"
            onClick={toggleDropdown}
          >
            <div className={`text-bold text-${textColor} flex flex-align-center`}>
              <Icon className={`${isAuthenticated ? "usa-icon--size-4" : "usa-icon--size-3"} margin-right-1`}>
                {accountIcon}
              </Icon>
              <div>{accountString}</div>
              <Icon className="usa-icon--size-3">arrow_drop_down</Icon>
            </div>
          </button>
          <Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal={true}>
            {({ TransitionProps, placement }) => (
              <Grow
                {...TransitionProps}
                style={{
                  transformOrigin: placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    {isAuthenticated ? AuthenticatedMenu() : UnAuthenticatedMenu()}
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </div>
      </div>
    </nav>
  );
};
