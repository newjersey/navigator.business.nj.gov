import { Button } from "@/components/njwds-extended/Button";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import analytics from "@/lib/utils/analytics";
import { AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

type Props = {
  isLargeScreen: boolean;
  scrolled: boolean;
};

export const NavBarLanding = ({ isLargeScreen, scrolled }: Props): ReactElement => {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const getLoginButtonText = (): string => {
    switch (state.isAuthenticated) {
      case IsAuthenticated.FALSE:
        return Config.navigationDefaults.logInButton;
      case IsAuthenticated.TRUE:
        return Config.navigationDefaults.logoutButton;
      case IsAuthenticated.UNKNOWN:
        return Config.navigationDefaults.logInButton;
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
                    router.push("/onboarding");
                    analytics.event.landing_page_navbar_register.click.open_create_account_modal();
                  }}
                >
                  {Config.navigationDefaults.registerButton}
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
