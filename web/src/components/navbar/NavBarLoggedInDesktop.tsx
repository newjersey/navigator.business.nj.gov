import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { onSignOut } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect, useMemo, useRef, useState } from "react";

type Props = {
  isWidePage?: boolean;
};

export const NavBarLoggedInDesktop = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();

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
            <div className="text-bold text-primary flex flex-align-center">
              <Icon className="usa-icon--size-4 margin-right-1">account_circle</Icon>
              <div>{userName}</div>
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
