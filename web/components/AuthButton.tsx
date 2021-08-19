import { ReactElement, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { useRouter } from "next/router";
import { onSignOut } from "@/lib/auth/signinHelper";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { triggerSignOut, triggerSignIn } from "@/lib/auth/sessionHelper";
import analytics from "@/lib/utils/analytics";
import { NavDefaults } from "@/display-content/NavDefaults";

interface Props {
  className?: string;
}

export const AuthButton = (props?: Props): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const logout = async () => {
    analytics.event.roadmap_logout_button.click.log_out();
    await triggerSignOut();
    onSignOut(router.push, dispatch);
  };

  const loginButton = () => (
    <button
      className="usa-button usa-button--outline auth-button margin-bottom-2 text-no-wrap"
      onClick={triggerSignIn}
    >
      {NavDefaults.logInButton}
    </button>
  );

  const logoutButton = () => (
    <button
      className={`${
        props?.className
          ? props.className
          : "usa-button usa-button--outline auth-button margin-bottom-2 text-no-wrap"
      }`}
      onClick={logout}
    >
      {NavDefaults.logoutButton}
    </button>
  );

  switch (state.isAuthenticated) {
    case IsAuthenticated.FALSE:
      return loginButton();
    case IsAuthenticated.TRUE:
      return logoutButton();
    case IsAuthenticated.UNKNOWN:
      return logoutButton();
  }
};
