import React, { ReactElement, useState, useRef, useEffect } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Icon } from "@/components/njwds/Icon";
import { AuthButton } from "@/components/AuthButton";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { NavDefaults } from "@/display-content/NavDefaults";
import { ClickAwayListener, Grow, Paper, Popper, MenuItem, MenuList } from "@material-ui/core";

export const NavBarLoggedInDesktop = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmail(userData);

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event: React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>): void => {
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
    <>
      <nav className="grid-container">
        <div className="display-flex flex-row flex-justify flex-align-center height-8">
          <img className="height-4" src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
          <div className="z-100">
            <button
              className="clear-button"
              ref={anchorRef}
              aria-controls={open ? "menu-list-grow" : undefined}
              aria-haspopup="true"
              onClick={handleToggle}
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
                        <MenuItem onClick={handleClose}>
                          <a
                            target="_blank"
                            rel="noreferrer"
                            className="text-no-underline font-body-2xs text-bold"
                            href={process.env.MYNJ_PROFILE_LINK || ""}
                          >
                            {NavDefaults.myNJAccountText}
                          </a>
                        </MenuItem>
                        <MenuItem onClick={handleClose}>
                          <AuthButton className="clear-button font-body-2xs text-primary text-bold text-left" />
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
    </>
  );
};
