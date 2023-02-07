// organize-imports-ignore
import "@newjersey/njwds/dist/css/styles.css";
import "../styles/main.scss";
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { AuthReducer, authReducer } from "@/lib/auth/AuthContext";
import { getCurrentUser } from "@/lib/auth/sessionHelper";
import { onGuestSignIn, onSignIn } from "@/lib/auth/signinHelper";
import { Roadmap, UpdateQueue, UserDataError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useMountEffect } from "@/lib/utils/helpers";
import { Hub, HubCapsule } from "@aws-amplify/core";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Script from "next/script";
import { ReactElement, useEffect, useReducer, useState } from "react";
import SEO from "../../next-seo.config";
import { SWRConfig } from "swr";
import { OperatingPhaseId, RegistrationStatus } from "@businessnjgovnavigator/shared";
import { SignUpSnackbar } from "@/components/auth/SignUpSnackbar";
import { SignUpModal } from "@/components/auth/SignUpModal";
import { SelfRegSnackbar } from "@/components/auth/SelfRegSnackbar";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthContext, initialState } from "@/contexts/authContext";
import MuiTheme from "@/lib/muiTheme";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { IntercomScript } from "@/components/tasks/IntercomScript";

AuthContext.displayName = "Authentication";
RoadmapContext.displayName = "Roadmap";
AuthAlertContext.displayName = "Authentication Snackbar";
ContextualInfoContext.displayName = "Contextual Info";
UserDataErrorContext.displayName = "User Data Error";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue | undefined>(undefined);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);
  const [registrationAlertStatus, _setRegistrationAlertStatus] = useState<RegistrationStatus | undefined>(
    UserDataStorageFactory().getRegistrationStatus()
  );

  const setRegistrationAlertStatus = (value: RegistrationStatus | undefined) => {
    _setRegistrationAlertStatus(value);
    UserDataStorageFactory().setRegistrationStatus(value);
  };

  const [authSnackbar, setAuthSnackbar] = useState<boolean>(false);
  const [authModal, setAuthModal] = useState<boolean>(false);
  const [contextualInfo, setContextualInfo] = useState<ContextualInfo>({
    isVisible: false,
    header: "",
    markdown: "",
  });
  const [userDataError, setUserDataError] = useState<UserDataError | undefined>(undefined);
  const router = useRouter();
  const GOOGLE_ANALYTICS_ID = process.env.GOOGLE_ANALYTICS_ID || "";
  const [operatingPhaseId, setOperatingPhaseId] = useState<OperatingPhaseId | undefined>(undefined);

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
          'dimension5': 'Home-Based Business',
          'dimension6': 'Persona',
          'dimension7': 'Registration Process',
          'dimension8': 'AB Experience',
          'dimension9': 'Six Digit NAICS Code',
          'dimension11': 'Phase',
          'dimension12': 'Sub-Persona',
        }
      });`,
        }}
      />
      <Script src="/vendor/js/uswds.min.js" />
      <Script src="/intercom/settings.js" />
      <Script src="/intercom/init.js" />
      <IntercomScript user={state.user} operatingPhaseId={operatingPhaseId} />
      <DefaultSeo {...SEO} />
      <IntercomContext.Provider value={{ setOperatingPhaseId }}>
        <SWRConfig value={{ provider: UserDataStorageFactory }}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={MuiTheme}>
              <AuthContext.Provider value={{ state, dispatch }}>
                <UpdateQueueContext.Provider value={{ updateQueue, setUpdateQueue }}>
                  <UserDataErrorContext.Provider value={{ userDataError, setUserDataError }}>
                    <ContextualInfoContext.Provider value={{ contextualInfo, setContextualInfo }}>
                      <RoadmapContext.Provider value={{ roadmap, setRoadmap }}>
                        <AuthAlertContext.Provider
                          value={{
                            isAuthenticated: state.isAuthenticated,
                            registrationAlertIsVisible: authSnackbar,
                            registrationModalIsVisible: authModal,
                            registrationAlertStatus,
                            setRegistrationAlertStatus,
                            setRegistrationAlertIsVisible: setAuthSnackbar,
                            setRegistrationModalIsVisible: setAuthModal,
                          }}
                        >
                          <ContextualInfoPanel />
                          <Component {...pageProps} />
                          <SignUpSnackbar />
                          <SignUpModal />
                          <SelfRegSnackbar />
                        </AuthAlertContext.Provider>
                      </RoadmapContext.Provider>
                    </ContextualInfoContext.Provider>
                  </UserDataErrorContext.Provider>
                </UpdateQueueContext.Provider>
              </AuthContext.Provider>
            </ThemeProvider>
          </StyledEngineProvider>
        </SWRConfig>
      </IntercomContext.Provider>
    </>
  );
};

export default App;
