import "../styles/global.scss";
import { AppProps } from "next/app";
import React, { ReactElement, useReducer, useState } from "react";
import { AuthContextType, AuthReducer, authReducer } from "../lib/auth/AuthContext";

import awsExports from "../aws-exports";
import { Amplify } from "aws-amplify";
import { useMountEffect } from "../lib/helpers";
import { getCurrentUser } from "../lib/auth/sessionHelper";
import { Roadmap } from "../lib/types/types";

Amplify.configure({ ...awsExports, ssr: true });

const initialState = {
  user: undefined,
  isAuthenticated: false,
};

export const AuthContext = React.createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});

export interface RoadmapContextType {
  roadmap: Roadmap | undefined;
  setRoadmap: (roadmap: Roadmap | undefined) => void;
}

export const RoadmapContext = React.createContext<RoadmapContextType>({
  roadmap: undefined,
  setRoadmap: () => {},
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);

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
      <link rel="stylesheet" href="/css/styles.css" />

      <AuthContext.Provider value={{ state, dispatch }}>
        <RoadmapContext.Provider value={{ roadmap, setRoadmap }}>
          <Component {...pageProps} />
        </RoadmapContext.Provider>
      </AuthContext.Provider>
    </>
  );
};

export default App;
