import React, { ReactElement, useState, useRef, useEffect, useContext } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Icon } from "@/components/njwds/Icon";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { NavDefaults } from "@/display-content/NavDefaults";
import { ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList } from "@mui/material";
import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { onSignOut } from "@/lib/auth/signinHelper";

export const NavBarLoggedInDesktop = (): ReactElement => {
  const { userData } = useUserData();
  const { dispatch } = useContext(AuthContext);
  const router = useRouter();

  const userName = getUserNameOrEmail(userData);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const toggleDropdown = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>): void => {
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

  return (
    <nav aria-label="Primary" className="grid-container">
      <div className="display-flex flex-row flex-justify flex-align-center height-8">
        <img className="height-4" src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
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
                        <button className="clear-button font-body-2xs text-bold text-primary">
                          {NavDefaults.myNJAccountText}
                        </button>
                      </MenuItem>
                      <MenuItem onClick={() => router.push("/profile")}>
                        <button className="clear-button font-body-2xs text-bold text-primary">
                          {NavDefaults.profileLinkText}
                        </button>
                      </MenuItem>
                      <MenuItem onClick={handleLogoutClick}>
                        <button className="clear-button font-body-2xs text-bold text-primary">
                          {NavDefaults.logoutButton}
                        </button>
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
