import "../styles/global.scss";
import { AppProps } from "next/app";
import React, { ReactElement, useReducer } from "react";
import { AuthContextType, AuthReducer, authReducer } from "../lib/auth/AuthContext";

import awsExports from "../aws-exports";
import { Amplify } from "aws-amplify";
import { useMountEffect } from "../lib/helpers";
import { getCurrentUser } from "../lib/auth/sessionHelper";

Amplify.configure({ ...awsExports, ssr: true });

const initialState = {
  user: undefined,
  isAuthenticated: false,
};

export const AuthContext = React.createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);

  useMountEffect(() => {
    getCurrentUser().then((currentUser) => {
      dispatch({
        type: "LOGIN",
        user: currentUser,
      });
    });
  });

  return (
    <>
      <script src="/js/uswds.js" />
      <script src="/js/uswds-init.js" />
      <link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet" />
      <link rel="stylesheet" href="/css/styles.css" />

      <AuthContext.Provider value={{ state, dispatch }}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </>
  );
};

export default App;
