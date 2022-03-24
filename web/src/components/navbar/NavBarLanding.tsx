import { Button } from "@/components/njwds-extended/Button";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import analytics from "@/lib/utils/analytics";
import { AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

export const NavBarLanding = (): ReactElement => {
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
      className={"grid-container-widescreen desktop:padding-x-7 height-8 flex flex-justify flex-align-center"}
    >
      <img className="height-4" src="/img/Navigator-logo@2x.png" alt="Business.NJ.Gov Navigator" />
      <div>
        <span className="margin-right-2">
          <Button style="tertiary" onClick={triggerSignIn}>
            {getLoginButtonText()}
          </Button>
        </span>
        <Button
          style="tertiary"
          onClick={() => {
            analytics.event.landing_page_navbar_register.click.go_to_onboarding();
            router.push("/onboarding");
          }}
        >
          {Config.navigationDefaults.registerButton}
        </Button>
      </div>
    </nav>
  );
};
