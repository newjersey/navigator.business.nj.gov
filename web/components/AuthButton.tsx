import { ReactElement, useContext } from "react";
import { AuthContext } from "@/pages/_app";
import { Auth } from "@aws-amplify/auth";
import { useRouter } from "next/router";
import { onSignOut } from "@/lib/auth/signinHelper";
import { IsAuthenticated } from "@/lib/auth/AuthContext";

export const AuthButton = (): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const login = async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await Auth.federatedSignIn({ provider: "myNJ" });
  };

  const logout = async () => {
    await Auth.signOut();
    onSignOut(router.push, dispatch);
  };

  const loginButton = () => (
    <button className="usa-button usa-button--outline auth-button" onClick={login}>
      Log in
    </button>
  );

  const logoutButton = () => (
    <button className="usa-button usa-button--outline auth-button" onClick={logout}>
      Log out
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
