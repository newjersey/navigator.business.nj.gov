import { Signup } from "@/components/Signup";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import analytics from "@/lib/utils/analytics";
import { AuthContext } from "@/pages/_app";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement, useContext, useState } from "react";
import { Button } from "../njwds-extended/Button";

type Props = {
  isLargeScreen: boolean;
  scrolled: boolean;
};

export const NavBarLanding = ({ isLargeScreen, scrolled }: Props): ReactElement => {
  const [signupIsOpen, setSignupIsOpen] = useState<boolean>(false);
  const { state } = useContext(AuthContext);

  const getLoginButtonText = (): string => {
    switch (state.isAuthenticated) {
      case IsAuthenticated.FALSE:
        return Defaults.navigationDefaults.logInButton;
      case IsAuthenticated.TRUE:
        return Defaults.navigationDefaults.logoutButton;
      case IsAuthenticated.UNKNOWN:
        return Defaults.navigationDefaults.logInButton;
    }
  };

  return (
    <nav
      aria-label="Primary"
      className={`grid-container width-100 padding-top-05 ${
        !isLargeScreen && scrolled ? "scrolled scrolled-transition bg-white-transparent" : ""
      }`}
    >
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">
          <div className="flex fac fjb">
            <div className="flex-custom">
              <img
                className="padding-top-1 logo-max-width"
                src="/img/Navigator-logo@2x.png"
                alt="Business.NJ.Gov Navigator"
              />
            </div>
            <div className="margin-left-auto flex fac">
              <span className="text-no-wrap padding-x-105">
                <Button style="tertiary" textBold onClick={triggerSignIn}>
                  {getLoginButtonText()}
                </Button>
              </span>
              <span className="text-no-wrap nav-padding-x">
                <Button
                  style="tertiary"
                  textBold
                  onClick={() => {
                    setSignupIsOpen(true);
                    analytics.event.landing_page_navbar_register.click.open_create_account_modal();
                  }}
                >
                  {Defaults.navigationDefaults.registerButton}
                </Button>
              </span>
            </div>
            <Signup isOpen={signupIsOpen} onClose={() => setSignupIsOpen(false)} />
          </div>
        </div>
      </div>
    </nav>
  );
};
