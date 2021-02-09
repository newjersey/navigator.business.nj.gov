import "../styles/global.scss";
import { AppProps } from "next/app";
import { ReactElement, useEffect, useReducer } from "react";
import netlifyAuth from "../lib/auth/netlify-auth";
import {
  AuthContextType,
  AuthReducer,
  authReducer,
} from "../lib/auth/AuthContext";
import React from "react";
import { BusinessUser } from "../lib/types";

const initialState = {
  user: null,
  isAuthenticated: false,
};

export const AuthContext = React.createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);

  useEffect(() => {
    netlifyAuth.initialize((user: BusinessUser) => {
      if (user) {
        dispatch({
          type: "LOGIN",
          user: user,
        });
      }
    });
  }, []);

  return (
    <>
      <script src="/js/uswds.js" />
      <script src="/js/uswds-init.js" />
      <link
        href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css"
        rel="stylesheet"
      />
      <link rel="stylesheet" href="/css/styles.css" />
      <AuthContext.Provider value={{ state, dispatch }}>
        <Component {...pageProps} />
      </AuthContext.Provider>
    </>
  );
};

export default App;
