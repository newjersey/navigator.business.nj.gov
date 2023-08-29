import { CircularIndicator } from "@/components/CircularIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthContext } from "@/contexts/authContext";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
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
    if (!router.isReady) {
      return;
    }
    if (router.query[QUERIES.code]) {
      getActiveUser().then((currentUser) => {
        dispatch({ type: "LOGIN", activeUser: currentUser });
      });
    } else if (router.asPath.includes(signInSamlError)) {
      onGuestSignIn(router.push, router.pathname, dispatch, { encounteredMyNjLinkingError: true });
    } else {
      triggerSignIn();
    }
  }, [router, dispatch]);

  useMountEffectWhenDefined(() => {
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
      router.push(ROUTES.dashboard);
    }
  }, userData);

  return (
    <PageSkeleton>
      <NavBar logoOnly="NAVIGATOR_LOGO" />
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <div className="margin-top-6">
            <CircularIndicator />
          </div>
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default LoadingPage;
