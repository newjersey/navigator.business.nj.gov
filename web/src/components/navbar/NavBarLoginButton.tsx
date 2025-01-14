import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

export const NavBarLoginButton = (): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();
  const loginPageEnabled = process.env.FEATURE_LOGIN_PAGE === "true";

  return (
    <span className="margin-right-2">
      <UnStyledButton
        dataTestid="login-button"
        onClick={(): void => {
          if (loginPageEnabled) {
            router && router.push(ROUTES.login);
          } else {
            triggerSignIn();
            analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
          }
        }}
      >
        {Config.navigationDefaults.logInButton}
      </UnStyledButton>
    </span>
  );
};
