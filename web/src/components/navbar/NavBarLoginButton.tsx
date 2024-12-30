import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useRouter } from "next/compat/router";
import { ReactElement } from "react";

export const NavBarLoginButton = (): ReactElement => {
  const { Config } = useConfig();
  const router = useRouter();
  return (
    <span className="margin-right-2">
      <UnStyledButton
        dataTestid="login-button"
        onClick={(): void => {
          router && router.push(ROUTES.login);
        }}
      >
        {Config.navigationDefaults.logInButton}
      </UnStyledButton>
    </span>
  );
};
