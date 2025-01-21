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
  const router = useRouter();
  const { dispatch } = useContext(AuthContext);
  const loginPageEnabled = process.env.FEATURE_LOGIN_PAGE === "true";

  useEffect(() => {
    /**
     * For client-side rendering of the Next.js router, the `query` property
     * is first initialized as an empty object. This `isReady` check ensures
     * we don't have false negatives when checking `router.query`.
     */
    if (!router?.isReady) {
      return;
    }

    if (router.query[QUERIES.code]) {
      getActiveUser().then((currentUser) => {
        dispatch({ type: "LOGIN", activeUser: currentUser });
      });
    } else if (router && router.asPath && router.asPath.includes(signInSamlError)) {
      analytics.event.landing_page.arrive.get_unlinked_myNJ_account();
      onGuestSignIn({
        push: router.push,
        pathname: router.pathname,
        dispatch,
        encounteredMyNjLinkingError: true,
      });
    } else {
      if (loginPageEnabled) {
        router && router.push(ROUTES.login);
      } else {
        triggerSignIn();
      }
    }
  }, [router, dispatch, loginPageEnabled]);

  useMountEffectWhenDefined(() => {
    if (!updateQueue) return;
    const business = updateQueue.currentBusiness();
    if (business?.onboardingFormProgress && !onboardingCompleted(business)) {
      router && router.push(ROUTES.onboarding);
    } else if (business.preferences.returnToLink) {
      const pageLink = business.preferences.returnToLink;
      updateQueue
        .queuePreferences({ returnToLink: "" })
        .update()
        .then(() => {
          router && router.push(pageLink);
        });
    } else {
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
