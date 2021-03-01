import { ReactElement, useContext } from "react";
import { AuthContext } from "../pages/_app";
import { Auth } from "@aws-amplify/auth";
import { useRouter } from "next/router";

export const AuthButton = (): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const router = useRouter();

  const login = () => {
    router.push("/signin");
  };

  const logout = async () => {
    await Auth.signOut();
    dispatch({
      type: "LOGOUT",
      user: undefined,
    });
  };

  const loginButton = () => (
    <button className="usa-button" onClick={login}>
      Log in
    </button>
  );

  const logoutButton = () => (
    <button className="usa-button usa-button--outline" onClick={logout}>
      Log out
    </button>
  );

  return state.isAuthenticated ? logoutButton() : loginButton();
};
