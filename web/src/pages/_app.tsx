// organize-imports-ignore
import "../styles/main.scss";
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { AuthReducer, authReducer } from "@/lib/auth/AuthContext";
import { getCurrentUser } from "@/lib/auth/sessionHelper";
import { onGuestSignIn, onSignIn } from "@/lib/auth/signinHelper";
import { Roadmap, SectionCompletion, UserDataError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { Hub, HubCapsule } from "@aws-amplify/core";
import { createTheme, StyledEngineProvider, Theme, ThemeProvider } from "@mui/material";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Script from "next/script";
import "njwds/dist/css/styles.css";
import { ReactElement, useEffect, useReducer, useState } from "react";
import SEO from "../../next-seo.config";
import { SWRConfig } from "swr";
import { RegistrationStatus } from "@businessnjgovnavigator/shared/";
import { SignUpToast } from "@/components/auth/SignUpToast";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { SelfRegToast } from "@/components/auth/SelfRegToast";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthContext, initialState } from "@/contexts/authContext";

declare module "@mui/styles/defaultTheme" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

AuthContext.displayName = "Authentication";
RoadmapContext.displayName = "Roadmap";
AuthAlertContext.displayName = "Authentication Toast";
ContextualInfoContext.displayName = "Contextual Info";
UserDataErrorContext.displayName = "User Data Error";

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
      main: "#4b7600",
      dark: "#466c04",
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
    MuiInputBase: {
      styleOverrides: {
        root: { marginTop: "0px" },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            backgroundColor: "#f0f0f0",
          },
          input: {
            "&.Mui-disabled": {
              color: "#1b1b1b",
              webkitTextFillColor: "#1b1b1b",
            },
          },
        },
      },
    },
  },
});

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);
  const [registrationAlertStatus, _setRegistrationAlertStatus] = useState<RegistrationStatus | undefined>(
    UserDataStorageFactory().getRegistrationStatus()
  );

  const setRegistrationAlertStatus = (value: RegistrationStatus | undefined) => {
    _setRegistrationAlertStatus(value);
    UserDataStorageFactory().setRegistrationStatus(value);
  };

  const [authToast, setAuthToast] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<boolean>(false);
  const [sectionCompletion, setSectionCompletion] = useState<SectionCompletion | undefined>(undefined);
  const [contextualInfo, setContextualInfo] = useState<ContextualInfo>({
    isVisible: false,
    header: "",
    markdown: "",
  });
  const [userDataError, setUserDataError] = useState<UserDataError | undefined>(undefined);
  const router = useRouter();
  const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";

  const listener = (data: HubCapsule): void => {
    switch (data.payload.event) {
      case "signIn":
        onSignIn(router.push, dispatch);
        break;
      case "signUp":
        break;
      case "signOut":
        break;
      case "signIn_failure":
        console.error("user sign in failed");
        break;
      case "tokenRefresh":
        break;
      case "tokenRefresh_failure":
        console.error("token refresh failed");
        break;
      case "configured":
        break;
    }
  };

  Hub.listen("auth", listener);

  useMountEffect(() => {
    if (!pageProps.noAuth) {
      getCurrentUser()
        .then((currentUser) => {
          dispatch({
            type: "LOGIN",
            user: currentUser,
          });
        })
        .catch(() => {
          onGuestSignIn(router.push, router.pathname, dispatch);
        });
    }
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
          'dimension5': 'Home-Based Business',
          'dimension6': 'Persona',
          'dimension7': 'Registration Process',
          'dimension8': 'AB Experience',
          'dimension9': 'Six Digit NAICS Code'
        }
      });`,
        }}
      />

      <Script src="/js/uswds.js" />
      <Script src="/js/uswds-init.js" />
      <Script src="/intercom/settings.js" />
      <Script src="/intercom/init.js" />
      {state.user?.myNJUserKey && (
        <Script
          src="/intercom/identity.js"
          data-user-id={state.user?.myNJUserKey}
          data-user-hash={state.user?.intercomHash}
          data-user-name={state.user?.name}
          data-user-email={state.user?.email}
        />
      )}
      <DefaultSeo {...SEO} />
      <SWRConfig value={{ provider: UserDataStorageFactory }}>
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={theme}>
            <AuthContext.Provider value={{ state, dispatch }}>
              <UserDataErrorContext.Provider value={{ userDataError, setUserDataError }}>
                <ContextualInfoContext.Provider value={{ contextualInfo, setContextualInfo }}>
                  <RoadmapContext.Provider
                    value={{ roadmap, setRoadmap, sectionCompletion, setSectionCompletion }}
                  >
                    <AuthAlertContext.Provider
                      value={{
                        isAuthenticated: state.isAuthenticated,
                        alertIsVisible: authToast,
                        modalIsVisible: authModal,
                        registrationAlertStatus,
                        setRegistrationAlertStatus,
                        setAlertIsVisible: setAuthToast,
                        setModalIsVisible: setAuthModal,
                      }}
                    >
                      <ContextualInfoPanel />
                      <Component {...pageProps} />
                      <SignUpToast />
                      <SignUpModal />
                      <SelfRegToast />
                    </AuthAlertContext.Provider>
                  </RoadmapContext.Provider>
                </ContextualInfoContext.Provider>
              </UserDataErrorContext.Provider>
            </AuthContext.Provider>
          </ThemeProvider>
        </StyledEngineProvider>
      </SWRConfig>
    </>
  );
};

export default App;
