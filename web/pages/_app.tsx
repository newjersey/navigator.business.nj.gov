import "../styles/global.scss";
import { AppProps } from "next/app";
import React, {
  ReactElement,
  createContext,
  useEffect,
  useReducer,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { createTheme, ThemeProvider, Theme, StyledEngineProvider } from "@mui/material";
import { Amplify, Hub } from "aws-amplify";
import { AuthContextType, AuthReducer, authReducer, IsAuthenticated } from "@/lib/auth/AuthContext";
import awsExports from "../aws-exports";
import { getCurrentUser, refreshToken } from "@/lib/auth/sessionHelper";
import { Roadmap, UserDataError } from "@/lib/types/types";
import { useMountEffect } from "@/lib/utils/helpers";
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { onSignIn } from "@/lib/auth/signinHelper";
import { useRouter } from "next/router";
import { HubCapsule } from "@aws-amplify/core";
import { DefaultSeo } from "next-seo";
import Script from "next/script";
import SEO from "../next-seo.config";
import analytics from "@/lib/utils/analytics";
import "../public/css/styles.css";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

Amplify.configure({
  ...awsExports,
  ssr: true,
  oauth: {
    domain: process.env.AUTH_DOMAIN,
    scope: ["email", "profile", "openid", "aws.cognito.signin.user.admin"],
    redirectSignIn: process.env.REDIRECT_URL,
    redirectSignOut: process.env.REDIRECT_URL,
    responseType: "code",
  },
  refreshHandlers: {
    myNJ: refreshToken,
  },
});

const initialState = {
  user: undefined,
  isAuthenticated: IsAuthenticated.UNKNOWN,
};

export const AuthContext = createContext<AuthContextType>({
  dispatch: () => {},
  state: initialState,
});

export interface RoadmapContextType {
  roadmap: Roadmap | undefined;
  setRoadmap: (roadmap: Roadmap | undefined) => void;
}

export const RoadmapContext = createContext<RoadmapContextType>({
  roadmap: undefined,
  setRoadmap: () => {},
});

export interface ContextualInfo {
  isVisible: boolean;
  markdown: string;
}

export interface ContextualInfoContextType {
  contextualInfo: ContextualInfo;
  setContextualInfo: Dispatch<SetStateAction<ContextualInfo>>;
}

export const ContextualInfoContext = createContext<ContextualInfoContextType>({
  contextualInfo: {
    isVisible: false,
    markdown: "",
  },
  setContextualInfo: () => {},
});

export interface UserDataErrorContextType {
  userDataError: UserDataError | undefined;
  setUserDataError: (userDataError: UserDataError | undefined) => void;
}

export const UserDataErrorContext = createContext<UserDataErrorContextType>({
  userDataError: undefined,
  setUserDataError: () => {},
});

const theme = createTheme({
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
  components: {
    MuiPaper: {
      styleOverrides: {
        elevation: 8,
      },
    },
    MuiAccordion: {
      defaultProps: {
        disableGutters: true,
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: { padding: "0px" },
        content: {
          margin: "0px",
        },
      },
    },
    MuiAccordionDetails: {
      styleOverrides: {
        root: {
          padding: "0px",
        },
      },
    },
  },
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);
  const [contextualInfo, setContextualInfo] = useState<ContextualInfo>({
    isVisible: false,
    markdown: "",
  });
  const [userDataError, setUserDataError] = useState<UserDataError | undefined>(undefined);
  const router = useRouter();

  const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

  const listener = (data: HubCapsule): void => {
    switch (data.payload.event) {
      case "signIn":
        console.log("user signed in");
        onSignIn(router.push, dispatch);
        break;
      case "signUp":
        console.log("user signed up");
        break;
      case "signOut":
        console.log("user signed out");
        break;
      case "signIn_failure":
        console.log("user sign in failed");
        break;
      case "tokenRefresh":
        console.log("token refresh succeeded");
        break;
      case "tokenRefresh_failure":
        console.log("token refresh failed");
        break;
      case "configured":
        console.log("the Auth module is configured");
    }
  };

  Hub.listen("auth", listener);

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

  useEffect(() => {
    analytics.pageview(router.asPath);
  }, [router.asPath]);

  return (
    <>
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`} />
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; 
      function gtag(){window.dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GOOGLE_ANALYTICS_ID}', { 
        'send_page_view': false,
        'custom_map': {
          'dimension1': 'Industry',
          'dimension2': 'Municipality',
          'dimension3': 'Legal Structure',
          'dimension4': 'Liquor License',
          'dimension5': 'Home-Based Business'
        }
      });`,
        }}
      />

      <Script src="/js/uswds.js" />
      <Script src="/js/uswds-init.js" />
      <Script src="/intercom/settings.js" />
      <Script src="/intercom/init.js" />
      <DefaultSeo {...SEO} />

      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={{ state, dispatch }}>
            <UserDataErrorContext.Provider value={{ userDataError, setUserDataError }}>
              <ContextualInfoContext.Provider value={{ contextualInfo, setContextualInfo }}>
                <RoadmapContext.Provider value={{ roadmap, setRoadmap }}>
                  <ContextualInfoPanel />
                  <Component {...pageProps} />
                </RoadmapContext.Provider>
              </ContextualInfoContext.Provider>
            </UserDataErrorContext.Provider>
          </AuthContext.Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
};

export default App;
