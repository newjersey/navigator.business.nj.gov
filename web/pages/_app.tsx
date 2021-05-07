import "../styles/global.scss";
import { AppProps } from "next/app";
import React, { ReactElement, useReducer, useState } from "react";
import { createMuiTheme, ThemeProvider } from "@material-ui/core";
import { Amplify } from "aws-amplify";
import { AuthContextType, AuthReducer, authReducer, IsAuthenticated } from "@/lib/auth/AuthContext";
import awsExports from "../aws-exports";
import { getCurrentUser } from "@/lib/auth/sessionHelper";
import { Roadmap } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";

Amplify.configure({ ...awsExports, ssr: true });

const initialState = {
  user: undefined,
  isAuthenticated: IsAuthenticated.UNKNOWN,
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

export interface ContextualInfoContextType {
  contextualInfoMd: string;
  setContextualInfoMd: (contextualInfoMd: string) => void;
}

export const ContextualInfoContext = React.createContext<ContextualInfoContextType>({
  contextualInfoMd: "",
  setContextualInfoMd: () => {},
});

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      "Public Sans Web",
      "-apple-system",
      "BlinkMacSystemFont",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
      "Apple Color Emoji",
      "Segoe UI Emoji",
      "Segoe UI Symbol",
    ].join(","),
  },
  palette: {
    primary: {
      light: "#7fb135",
      main: "#538200",
      dark: "#243413",
      contrastText: "#f0f0f0",
    },
    secondary: {
      light: "#73b3e7",
      main: "#2378c3",
      dark: "#162e51",
      contrastText: "#f0f0f0",
    },
  },
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);
  const [contextualInfoMd, setContextualInfoMd] = useState<string>("");

  useMountEffect(() => {
    getCurrentUser()
      .then((currentUser) => {
        dispatch({
          type: "LOGIN",
          user: currentUser,
        });
      })
      .catch(() => {
        dispatch({
          type: "LOGOUT",
          user: undefined,
        });
      });
  });

  return (
    <>
      <script src="/js/uswds.js" />
      <script src="/js/uswds-init.js" />
      <link rel="stylesheet" href="/css/styles.css" />
      <script src="/intercom/settings.js" />
      <script src="/intercom/init.js" />

      <ThemeProvider theme={theme}>
        <AuthContext.Provider value={{ state, dispatch }}>
          <ContextualInfoContext.Provider value={{ contextualInfoMd, setContextualInfoMd }}>
            <RoadmapContext.Provider value={{ roadmap, setRoadmap }}>
              <ContextualInfoPanel />
              <Component {...pageProps} />
            </RoadmapContext.Provider>
          </ContextualInfoContext.Provider>
        </AuthContext.Provider>
      </ThemeProvider>
    </>
  );
};

export default App;
