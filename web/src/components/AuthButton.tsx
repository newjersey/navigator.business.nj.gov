import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
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

  const loginButton = (): ReactElement => {
    return (
      <UnStyledButton
        style="tertiary"
        dataTestid="login-button"
        noRightMargin
        widthAutoOnMobile
        onClick={(): void => {
          triggerSignIn();
          analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
        }}
      >
        {Config.navigationDefaults.logInButton}
      </UnStyledButton>
    );
  };

  const logoutButton = (): ReactElement => {
    return (
      <UnStyledButton
        style="tertiary"
        noRightMargin
        onClick={(): void => {
          onSignOut(router.push, dispatch);
        }}
      >
        <span className={props?.landing ? "text-primary" : "text-base"}>
          {Config.navigationDefaults.logoutButton}
        </span>
      </UnStyledButton>
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
