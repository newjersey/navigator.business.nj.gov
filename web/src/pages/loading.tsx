import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { AuthContext } from "@/contexts/authContext";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { onboardingCompleted } from "@businessnjgovnavigator/shared";
import { GetStaticPropsResult } from "next";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect } from "react";

export const signInSamlError = "Name+ID+value+was+not+found+in+SAML";

const LoadingPage = (): ReactElement => {
  const { updateQueue, userData } = useUserData();
  const router = useRouter();
  const { dispatch } = useContext(AuthContext);

  useEffect(() => {
    console.log("useEffect");
    if (!router.isReady) {
      return;
    }
    if (router.query[QUERIES.code]) {
      getActiveUser().then((currentUser) => {
        dispatch({ type: "LOGIN", activeUser: currentUser });
      });
    } else if (router.asPath.includes(signInSamlError)) {
      analytics.event.landing_page.arrive.get_unlinked_myNJ_account();
      onGuestSignIn({
        push: router.push,
        pathname: router.pathname,
        dispatch,
        encounteredMyNjLinkingError: true,
      });
    } else {
      triggerSignIn();
    }
  }, [router, dispatch]);

  useMountEffectWhenDefined(() => {
    console.log("useMountEffectWhenDefined");
    if (!updateQueue) return;
    const business = updateQueue.currentBusiness();
    if (!onboardingCompleted(business)) {
      router.push(ROUTES.onboarding);
    } else if (business.preferences.returnToLink) {
      const pageLink = business.preferences.returnToLink;
      updateQueue
        .queuePreferences({ returnToLink: "" })
        .update()
        .then(() => {
          router.push(pageLink);
        });
    } else {
      updateQueue.update().then(() => {
        router.push(ROUTES.dashboard);
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
