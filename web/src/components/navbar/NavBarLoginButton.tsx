import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

export const NavBarLoginButton = (): ReactElement => {
  const { Config } = useConfig();
  return (
    <span className="margin-right-2">
      <UnStyledButton
        dataTestid="login-button"
        onClick={(): void => {
          triggerSignIn();
          analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
        }}
      >
        {Config.navigationDefaults.logInButton}
      </UnStyledButton>
    </span>
  );
};
