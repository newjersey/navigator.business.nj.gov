import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSignOut } from "@/lib/auth/signinHelper";
import analytics from "@/lib/utils/analytics";
import { AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import React, { ReactElement, useContext } from "react";

interface Props {
  className?: string;
  position?: "HERO" | "NAVBAR";
}

export const AuthButton = (props?: Props): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const loginButton = () => (
    <button
      data-testid="login-button"
      className="usa-button usa-button--outline auth-button margin-bottom-2 text-no-wrap"
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
    </button>
  );

  const logoutButton = () => (
    <button
      data-log-out-button
      className={`${
        props?.className
          ? props.className
          : "usa-button usa-button--outline auth-button margin-bottom-2 text-no-wrap"
      }`}
      onClick={() => onSignOut(router.push, dispatch)}
    >
      {Config.navigationDefaults.logoutButton}
    </button>
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
