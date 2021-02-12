import netlifyAuth from "../lib/auth/netlify-auth";
import { ReactElement, useContext } from "react";
import { AuthContext, FormContext } from "../pages/_app";
import { BusinessUser } from "../lib/types/BusinessUser";

interface Props {
  onLogin?: () => void;
  onLogout?: () => void;
}

export const AuthButton = (props: Props): ReactElement => {
  const { state, dispatch } = useContext(AuthContext);
  const { formData, setFormData } = useContext(FormContext);

  const login = () => {
    netlifyAuth.authenticate((user: BusinessUser) => {
      dispatch({
        type: "LOGIN",
        user: user,
      });
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          email: user.email,
        },
      });
      if (props.onLogin) {
        props.onLogin();
      }
    });
  };

  const logout = () => {
    netlifyAuth.signout(() => {
      dispatch({
        type: "LOGOUT",
        user: undefined,
      });
      setFormData({});
      if (props.onLogout) {
        props.onLogout();
      }
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
