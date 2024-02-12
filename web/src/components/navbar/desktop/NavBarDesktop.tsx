import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import { NavBarDesktopHomeLogo } from "@/components/navbar/desktop/NavBarDesktopHomeLogo";
import { NavBarDesktopWrapper } from "@/components/navbar/desktop/NavBarDesktopWrapper";
import { NavBarLandingDesktop } from "@/components/navbar/desktop/NavBarLandingDesktop";
import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { Icon } from "@/components/njwds/Icon";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useRef, useState } from "react";


interface Props {
  previousBusinessId?: string | undefined;
  isLanding: boolean | undefined;
  logoOnlyType?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  currentlyOnboarding: boolean | undefined;
  isAuthenticated: boolean;
}

export const NavBarDesktop = (props: Props): ReactElement => {
  const { business, userData } = useUserData();
  const router = useRouter();
  const { Config } = useConfig();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);




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



  const textColor = props.isAuthenticated ? "primary" : "base";
  const accountIcon = props.isAuthenticated ? "account_circle" : "help";
  const navBarBusinessTitle = getNavBarBusinessTitle(business, props.isAuthenticated);
  const currentIndex =
    userData && business ? orderBusinessIdsByDateCreated(userData).indexOf(business.id) : 0;





    if(props.logoOnlyType){ // loading/redirect
      return <NavBarLogoOnly logoType={props.logoOnlyType} />
    }
    else if(props.isLanding){ // landing
      return (
        <NavBarLandingDesktop />
      );
    }
    else if(props.currentlyOnboarding){ // onboarding
      return (
      <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId}/>
      </NavBarDesktopWrapper>
      );
    }
    else if(props.isAuthenticated){ // authed
      return (
        <NavBarDesktopWrapper>
          <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId}/>
          <NavBarDesktopDropDown
            currentIndex={currentIndex}
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            navBarBusinessTitle={navBarBusinessTitle}
            isAuthenticated={props.isAuthenticated}
            handleClose={handleClose}
            textColor={textColor}
          />
        </NavBarDesktopWrapper>
        );
    }
    else{ // guest
      return (
        <>stuff</>
      );
    }


    // landing
      // login / dropdown [title, get started]
      // has support links
    // onboarding
      // login / disabled dropdown []
      // no support links
    // guest other
      // login / drop down [title, profile block, link with myNJ]
      // has support links
    // authed other
      // no login / dropdown [title, profile block, add business, myNJ account, log out]
      // hass support links






  return (
    <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId}/>
          <div className="flex z-100">
            {!props.isAuthenticated && (
              <div className="flex fac">
                {!props.currentlyOnboarding && (
                  <div data-testid="registration-button" className="margin-left-4">
                    <UnStyledButton
                      onClick={(): void => {
                        analytics.event.guest_menu.click.go_to_NavigatorAccount_setup();
                        router.push(ROUTES.accountSetup);
                      }}
                    >
                      {Config.navigationDefaults.navBarGuestRegistrationText}
                    </UnStyledButton>
                  </div>
                )}
                <div className="margin-left-4 text-base-lighter">|</div>
                <div data-testid="login-button" className="margin-right-4 margin-left-4">
                  <UnStyledButton
                    onClick={(): void => {
                      analytics.event.guest_menu.click.go_to_NavigatorAccount_setup();
                      triggerSignIn();
                    }}
                  >
                    {Config.navigationDefaults.logInButton}
                  </UnStyledButton>
                </div>
                {props.currentlyOnboarding && (
                  <div className={`text-bold text-${textColor} flex flex-align-center`}>
                    <Icon
                      className={`${
                        props.isAuthenticated ? "usa-icon--size-4" : "usa-icon--size-3"
                      } margin-right-1`}
                    >
                      {accountIcon}
                    </Icon>
                    <div className="truncate-long-business-names_NavBarDesktop">{navBarBusinessTitle}</div>
                  </div>
                )}
              </div>
            )}

          </div>
        </NavBarDesktopWrapper>
  );
};






