import { ReactElement, useContext } from "react";
import { AuthContext } from "../pages/_app";

interface Props {
  onLogin?: () => void;
  onLogout?: () => void;
}

export const AuthButton = (props: Props): ReactElement => {
  const { state } = useContext(AuthContext);

  const login = () => {
    if (props.onLogin) {
      props.onLogin();
    }
  };

  const logout = () => {
    if (props.onLogout) {
      props.onLogout();
    }
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
