/* eslint-disable @next/next/next-script-for-ga */
// organize-imports-ignore
import "@newjersey/njwds/dist/css/styles.css";
import "../styles/main.scss";
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { AuthReducer, authReducer } from "@/lib/auth/AuthContext";
import { getActiveUser } from "@/lib/auth/sessionHelper";
import { onGuestSignIn, onSignIn } from "@/lib/auth/signinHelper";
import { Roadmap, UpdateQueue, UserDataError } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { GTM_ID } from "@/lib/utils/analytics";
import { useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Hub, HubCapsule } from "@aws-amplify/core";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import { useRouter } from "next/router";
import Script from "next/script";
import { ReactElement, useEffect, useReducer, useState } from "react";
import { SWRConfig } from "swr";
import { BusinessPersona, OperatingPhaseId, RegistrationStatus } from "@businessnjgovnavigator/shared";
import { NeedsAccountSnackbar } from "@/components/auth/NeedsAccountSnackbar";
import { NeedsAccountModal } from "@/components/auth/NeedsAccountModal";
import { RegistrationStatusSnackbar } from "@/components/auth/RegistrationStatusSnackbar";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthContext, initialState } from "@/contexts/authContext";
import MuiTheme from "@/lib/muiTheme";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { IntercomScript } from "@/components/IntercomScript";
import { setOnLoadDimensions } from "@/lib/utils/analytics-helpers";
import { useConfig } from "@/lib/data-hooks/useConfig";
AuthContext.displayName = "Authentication";
RoadmapContext.displayName = "Roadmap";
NeedsAccountContext.displayName = "Needs Account";
ContextualInfoContext.displayName = "Contextual Info";
UserDataErrorContext.displayName = "User Data Error";

const App = ({ Component, pageProps }: AppProps): ReactElement => {
  const [state, dispatch] = useReducer<AuthReducer>(authReducer, initialState);
  const [updateQueue, setUpdateQueue] = useState<UpdateQueue | undefined>(undefined);
  const [roadmap, setRoadmap] = useState<Roadmap | undefined>(undefined);
  const [registrationStatus, setRegistrationStatus] = useState<RegistrationStatus | undefined>(
    UserDataStorageFactory().getRegistrationStatus()
  );

  const { Config } = useConfig();

  const setRegistrationStatusInStateAndStorage = (value: RegistrationStatus | undefined): void => {
    setRegistrationStatus(value);
    UserDataStorageFactory().setRegistrationStatus(value);
  };

  const [showNeedsAccountSnackbar, setShowNeedsAccountSnackbar] = useState<boolean>(false);
  const [showNeedsAccountModal, setShowNeedsAccountModal] = useState<boolean>(false);
  const [contextualInfo, setContextualInfo] = useState<ContextualInfo>({
    isVisible: false,
    header: "",
    markdown: "",
  });
  const [userDataError, setUserDataError] = useState<UserDataError | undefined>(undefined);
  const router = useRouter();
  const [operatingPhaseId, setOperatingPhaseId] = useState<OperatingPhaseId | undefined>(undefined);
  const [legalStructureId, setLegalStructureId] = useState<string | undefined>(undefined);
  const [industryId, setIndustryId] = useState<string | undefined>(undefined);
  const [businessPersona, setBusinessPersona] = useState<BusinessPersona | undefined>(undefined);

  const showGtm = !(process.env.DISABLE_GTM === "true");

  useEffect(() => {
    router.events.on("routeChangeComplete", analytics.pageview);
    return () => {
      router.events.off("routeChangeComplete", analytics.pageview);
    };
  }, [router.events]);

  const listener = (data: HubCapsule): void => {
    switch (data.payload.event) {
      case "signIn":
        onSignIn(dispatch);
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

  useMountEffectWhenDefined(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    setOnLoadDimensions(updateQueue!.current());
  }, updateQueue?.current);

  useMountEffect(() => {
    if (!pageProps.noAuth) {
      getActiveUser()
        .then((activeUser) => {
          dispatch({
            type: "LOGIN",
            activeUser: activeUser,
          });
        })
        .catch(() => {
          onGuestSignIn({ push: router.push, pathname: router.pathname, dispatch });
        });
    }
  });

  return (
    <>
      {showGtm && (
        <Script id="google-tag-manager">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      )}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.dataLayer = window.dataLayer || []; 
          function gtm(layer){window.dataLayer.push(layer);};      `,
        }}
      />
      <Script src="/vendor/js/uswds.min.js" />
      <Script src="/intercom/settings.js" />
      <Script src="/intercom/init.js" />
      <IntercomScript
        user={updateQueue?.current().user}
        operatingPhaseId={operatingPhaseId}
        legalStructureId={legalStructureId}
        industryId={industryId}
        businessPersona={businessPersona}
      />
      <DefaultSeo
        title={Config.pagesMetadata.titlePrefix}
        description={Config.pagesMetadata.siteDescription}
      />
      <IntercomContext.Provider
        value={{ setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona }}
      >
        <SWRConfig value={{ provider: UserDataStorageFactory }}>
          <StyledEngineProvider injectFirst>
            <ThemeProvider theme={MuiTheme}>
              <AuthContext.Provider value={{ state, dispatch }}>
                <UpdateQueueContext.Provider value={{ updateQueue, setUpdateQueue }}>
                  <UserDataErrorContext.Provider value={{ userDataError, setUserDataError }}>
                    <ContextualInfoContext.Provider value={{ contextualInfo, setContextualInfo }}>
                      <RoadmapContext.Provider value={{ roadmap, setRoadmap }}>
                        <NeedsAccountContext.Provider
                          value={{
                            isAuthenticated: state.isAuthenticated,
                            showNeedsAccountSnackbar,
                            showNeedsAccountModal,
                            registrationStatus: registrationStatus,
                            setRegistrationStatus: setRegistrationStatusInStateAndStorage,
                            setShowNeedsAccountSnackbar,
                            setShowNeedsAccountModal,
                          }}
                        >
                          <ContextualInfoPanel />
                          <Component {...pageProps} />
                          <NeedsAccountSnackbar />
                          <NeedsAccountModal />
                          <RegistrationStatusSnackbar />
                        </NeedsAccountContext.Provider>
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
