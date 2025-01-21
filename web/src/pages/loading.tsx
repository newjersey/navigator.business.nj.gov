import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { AuthContext } from "@/contexts/authContext";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { onboardingCompleted } from "@businessnjgovnavigator/shared/";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useEffect } from "react";

export const signInSamlError = "Name+ID+value+was+not+found+in+SAML";

const LoadingPage = (): ReactElement => {
  const { updateQueue, userData } = useUserData();
  console.log(`loading page render, userData: ${userData}`);

  const router = useRouter();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    // Set up an interval to run every 10 seconds (10000 milliseconds)
    const intervalId = setInterval(() => {
      console.log(userData); // Print the variable to the console
    }, 3000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, [userData]);

  console.log(
    "loading router",
    `ROUTER: ${JSON.stringify(router)}`,
    `QUERY: ${JSON.stringify(router?.query)}`
  );
  console.log("loading dispatch", dispatch);
  console.log("loading userData", userData);

  useEffect(() => {
    console.log("generally in loading first use Effect");

    if (!router) {
      console.log("died, returned early in loading");
      return;
    }

    const params = new URLSearchParams(location.search);
    const hasCodeQuery = params.get("code");
    console.log("location search", location.search);
    console.log("hasCodeQuery", hasCodeQuery);

    if (router.query[QUERIES.code] || hasCodeQuery) {
      console.log("will trigger login dispatch");
      getActiveUser().then((currentUser) => {
        dispatch({ type: "LOGIN", activeUser: currentUser });
      });
    } else if (router && router.asPath && router.asPath.includes(signInSamlError)) {
      console.log("will trigger gues sign in from loading");
      analytics.event.landing_page.arrive.get_unlinked_myNJ_account();
      onGuestSignIn({
        push: router.push,
        pathname: router.pathname,
        dispatch,
        encounteredMyNjLinkingError: true,
      });
    } else {
      console.log("in trigger signin block");
      triggerSignIn();
    }
  }, [router, dispatch]);

  useMountEffectWhenDefined(() => {
    console.log("in useMountEffectWhenDefined block");
    if (!updateQueue) return;
    const business = updateQueue.currentBusiness();
    if (!onboardingCompleted(business)) {
      console.log("push onboarding from loading");
      router && router.push(ROUTES.onboarding);
    } else if (business.preferences.returnToLink) {
      console.log("return to link from loading");
      const pageLink = business.preferences.returnToLink;
      updateQueue
        .queuePreferences({ returnToLink: "" })
        .update()
        .then(() => {
          router && router.push(pageLink);
        });
    } else {
      console.log("will push dashbaord from loading");
      updateQueue.update().then(() => {
        router && router.push(ROUTES.dashboard);
      });
    }
  }, userData);

  return <LoadingPageComponent />;
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default LoadingPage;
