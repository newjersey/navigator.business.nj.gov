/* eslint-disable @next/next/next-script-for-ga */
// organize-imports-ignore
import { ContextualInfoPanel } from "@/components/ContextualInfoPanel";
import { IntercomScript } from "@/components/IntercomScript";
import { NeedsAccountModal } from "@/components/auth/NeedsAccountModal";

import { RegistrationStatusSnackbar } from "@/components/auth/RegistrationStatusSnackbar";
import { AuthContext, initialState } from "@/contexts/authContext";
import { getMergedConfig } from "@/contexts/configContext";
import { ContextualInfo, ContextualInfoContext } from "@/contexts/contextualInfoContext";
import { IntercomContext } from "@/contexts/intercomContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { RoadmapContext } from "@/contexts/roadmapContext";
import { UpdateQueueContext } from "@/contexts/updateQueueContext";
import { UserDataErrorContext } from "@/contexts/userDataErrorContext";
import { AuthReducer, authReducer } from "@/lib/auth/AuthContext";
import { getActiveUser } from "@/lib/auth/sessionHelper";
import { onGuestSignIn, onSignIn } from "@/lib/auth/signinHelper";
import MuiTheme from "@/lib/muiTheme";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import { Roadmap, UpdateQueue, UserDataError } from "@/lib/types/types";
import analytics, { GTM_ID } from "@/lib/utils/analytics";
import { setOnLoadDimensions } from "@/lib/utils/analytics-helpers";
import { useMountEffect, useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { Hub, HubCapsule } from "@aws-amplify/core";
import { BusinessPersona, OperatingPhaseId, RegistrationStatus } from "@businessnjgovnavigator/shared";
import { StyledEngineProvider, ThemeProvider } from "@mui/material";
import "@newjersey/njwds/dist/css/styles.css";
import { DefaultSeo } from "next-seo";
import { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import { ReactElement, useEffect, useReducer, useState } from "react";
import { SWRConfig } from "swr";

import { insertIndustryContent } from "@/lib/domain-logic/starterKits";
import "../styles/main.scss";
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
  const config = getMergedConfig();
  const showGtm = !(process.env.DISABLE_GTM === "true");

  useEffect(() => {
    router.events.on("routeChangeComplete", analytics.pageview);
    return (): void => {
      router.events.off("routeChangeComplete", analytics.pageview);
    };
  }, [router.events]);

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

  const isSeoPage = router.pathname.includes("/starter-kits");

  const heroTitle = insertIndustryContent(
    config.starterKits.hero.title,
    pageProps.industry?.id,
    pageProps.industry?.name
  );

  const description = insertIndustryContent(
    config.starterKits.seo.description,
    pageProps.industry?.id,
    pageProps.industry?.name
  );

  const imageAlt = insertIndustryContent(
    config.starterKits.seo.imageAltText,
    pageProps.industry?.id,
    pageProps.industry?.name
  );

  const DEFAULT_BASE_URL = "https://navigator.business.nj.gov/dashboard";
  const baseUrl = process.env.NEXT_PUBLIC_WEB_BASE_URL ?? DEFAULT_BASE_URL;
  const imageUrl = new URL("/img/team-success.jpg", baseUrl).href;

  return (
    <>
      <Head>
        <meta name="viewport" content="width=360, initial-scale=1" />
        {isSeoPage && (
          <>
            <meta property="og:title" content={heroTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:secure_url" content={imageUrl} />
            <meta property="og:image:type" content="image/jpg" />
            <meta property="og:image:width" content="1920" />
            <meta property="og:image:height" content="1080" />
            <meta property="og:image:alt" content={imageAlt} />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@businessnjgov" />
            <meta name="twitter:title" content={heroTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={imageAlt} />
          </>
        )}
      </Head>
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
        title={config.pagesMetadata.titlePostfix}
        description={config.pagesMetadata.siteDescription}
      />
      <IntercomContext.Provider
        value={{ setOperatingPhaseId, setLegalStructureId, setIndustryId, setBusinessPersona }}
      >
        <StyledEngineProvider injectFirst>
          <ThemeProvider theme={MuiTheme}>
            {isSeoPage ? (
              <Component {...pageProps} />
            ) : (
              <SWRConfig value={{ provider: UserDataStorageFactory }}>
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
                            <NeedsAccountModal />
                            <RegistrationStatusSnackbar />
                          </NeedsAccountContext.Provider>
                        </RoadmapContext.Provider>
                      </ContextualInfoContext.Provider>
                    </UserDataErrorContext.Provider>
                  </UpdateQueueContext.Provider>
                </AuthContext.Provider>
              </SWRConfig>
            )}
          </ThemeProvider>
        </StyledEngineProvider>
      </IntercomContext.Provider>
    </>
  );
};

export default App;
