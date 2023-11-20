import { ButtonIcon } from "@/components/ButtonIcon";
import { NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { NavigatorLogo } from "@/components/navbar/NavigatorLogo";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { AuthContext } from "@/contexts/authContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { ClickAwayListener, Grow, Paper, Popper } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useEffect, useMemo, useRef, useState } from "react";

export const NavBarDesktop = (): ReactElement => {
  const { business, userData } = useUserData();
  const { state } = useContext(AuthContext);
  const router = useRouter();
  const { Config } = useConfig();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const toggleDropdown = (): void => {
    if (!open) {
      analytics.event.account_name.click.expand_account_menu();
    }
    setOpen((prevOpen) => {
      return !prevOpen;
    });
  };

  const currentlyOnboarding = (): boolean => {
    if (!router) {
      return false;
    }
    return router.pathname === ROUTES.onboarding;
  };

  const handleClose = (
    event?: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
    if (event && anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);

  const textColor = isAuthenticated ? "primary" : "base";
  const accountIcon = isAuthenticated ? "account_circle" : "help";
  const navBarBusinessTitle = getNavBarBusinessTitle(business, state.isAuthenticated);
  const currentIndex =
    userData && business ? orderBusinessIdsByDateCreated(userData).indexOf(business.id) : 0;

  return (
    <div className="position-sticky top-0 z-500 bg-white">
      <nav aria-label="Primary" className="grid-container-widescreen desktop:padding-x-7">
        <div className="display-flex flex-row flex-justify flex-align-center height-8">
          <NavigatorLogo />
          <div className="flex z-100">
            {!isAuthenticated && (
              <div className="flex fac">
                {!currentlyOnboarding() && (
                  <div data-testid="registration-button" className="margin-left-4">
                    <UnStyledButton
                      style="standard"
                      onClick={(): void => {
                        analytics.event.guest_menu.click.go_to_NavigatorAccount_setup();
                        router.push(ROUTES.accountSetup);
                      }}
                    >
                      {Config.navigationDefaults.navBarGuestRegistrationText}
                    </UnStyledButton>
                  </div>
                )}
                <div data-testid="login-button" className="margin-right-4 margin-left-4">
                  <UnStyledButton
                    style="standard"
                    onClick={(): void => {
                      analytics.event.guest_menu.click.go_to_NavigatorAccount_setup();
                      triggerSignIn();
                    }}
                  >
                    {Config.navigationDefaults.logInButton}
                  </UnStyledButton>
                </div>
                <div className="margin-right-4 text-base">|</div>
                {currentlyOnboarding() && (
                  <div className={`text-bold text-${textColor} flex flex-align-center`}>
                    <Icon
                      className={`${
                        isAuthenticated ? "usa-icon--size-4" : "usa-icon--size-3"
                      } margin-right-1`}
                    >
                      {accountIcon}
                    </Icon>
                    <div className="truncate-long-business-names_NavBarDesktop">{navBarBusinessTitle}</div>
                  </div>
                )}
              </div>
            )}
            {!currentlyOnboarding() && (
              <button
                data-testid="profile-dropdown"
                className="border-2px border-solid radius-pill border-base-lighter bg-white-transparent"
                ref={anchorRef}
                aria-controls={open ? "menu-list-grow" : undefined}
                aria-haspopup="true"
                onClick={toggleDropdown}
              >
                <div className={`text-bold text-${textColor} flex flex-align-center margin-left-1`}>
                  <ButtonIcon svgFilename={`business-${getBusinessIconColor(currentIndex)}`} sizePx="35px" />
                  <div className="text-base-darkest truncate-long-business-names_NavBarDesktop">
                    {navBarBusinessTitle}
                  </div>
                  <Icon className="usa-icon--size-3">arrow_drop_down</Icon>
                </div>
              </button>
            )}

            <Popper
              open={open}
              anchorEl={anchorRef.current}
              role={undefined}
              transition
              disablePortal={true}
              placement="bottom-end"
            >
              {({ TransitionProps, placement }): JSX.Element => {
                return (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: placement.startsWith("bottom") ? "center top" : "center bottom",
                    }}
                  >
                    <Paper>
                      <ClickAwayListener onClickAway={handleClose}>
                        <div>
                          <NavBarPopupMenu
                            handleClose={(): void => setOpen(false)}
                            open={open}
                            menuConfiguration={
                              isAuthenticated ? "profile-mynj-addbusiness-logout" : "profile"
                            }
                          />
                        </div>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                );
              }}
            </Popper>
          </div>
        </div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
