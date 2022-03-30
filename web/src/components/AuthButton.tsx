import { Button } from "@/components/njwds-extended/Button";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSignOut } from "@/lib/auth/signinHelper";
import analytics from "@/lib/utils/analytics";
import { AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

interface Props {
  position: "HERO" | "NAVBAR";
  landing?: boolean;
}

export const AuthButton = (props?: Props): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const loginButton = () => (
    <Button
      style={props?.position === "HERO" ? `secondary-big` : "tertiary"}
      data-testid="login-button"
      noRightMargin
      widthAutoOnMobile
      onClick={() => {
        triggerSignIn();
        if (props?.position === "HERO") {
          analytics.event.landing_page_hero_log_in.click.go_to_myNJ_login();
        } else if (props?.position === "NAVBAR") {
          analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
        }
      }}
    >
      {Config.navigationDefaults.logInButton}
    </Button>
  );

  const logoutButton = () => (
    <Button
      style={props?.position === "HERO" ? `secondary-big` : "tertiary"}
      noRightMargin
      onClick={() => onSignOut(router.push, dispatch)}
    >
      <span className={props?.landing ? "text-primary" : "text-base"}>
        {Config.navigationDefaults.logoutButton}
      </span>
    </Button>
  );

  switch (state.isAuthenticated) {
    case IsAuthenticated.FALSE:
      return loginButton();
    case IsAuthenticated.TRUE:
      return logoutButton();
    case IsAuthenticated.UNKNOWN:
      return loginButton();
  }
};
