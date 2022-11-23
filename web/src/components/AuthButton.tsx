import { Button } from "@/components/njwds-extended/Button";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSignOut } from "@/lib/auth/signinHelper";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

interface Props {
  landing?: boolean;
}

export const AuthButton = (props?: Props): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const loginButton = () => {
    return (
      <Button
        style="tertiary"
        dataTestid="login-button"
        noRightMargin
        widthAutoOnMobile
        onClick={() => {
          triggerSignIn();
          analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
        }}
      >
        {Config.navigationDefaults.logInButton}
      </Button>
    );
  };

  const logoutButton = () => {
    return (
      <Button
        style="tertiary"
        noRightMargin
        onClick={() => {
          return onSignOut(router.push, dispatch);
        }}
      >
        <span className={props?.landing ? "text-primary" : "text-base"}>
          {Config.navigationDefaults.logoutButton}
        </span>
      </Button>
    );
  };

  switch (state.isAuthenticated) {
    case IsAuthenticated.FALSE:
      return loginButton();
    case IsAuthenticated.TRUE:
      return logoutButton();
    case IsAuthenticated.UNKNOWN:
      return loginButton();
  }
};
