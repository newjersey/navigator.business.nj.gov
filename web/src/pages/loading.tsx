import { onboardingCompleted } from "@businessnjgovnavigator/shared/";
import type { GetStaticPropsResult } from "next";
import { useRouter } from "next/compat/router";
import { type ReactElement, useContext, useEffect, useState } from "react";
import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { AuthContext } from "@/contexts/authContext";
import * as api from "@/lib/api-client/apiClient";
import { ensureProfileNJUserRecord } from "@/lib/auth/profileNjFirstLogin";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { UserDataStorageFactory } from "@/lib/storage/UserDataStorage";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";

export const signInSamlError = "Name+ID+value+was+not+found+in+SAML";

const LoadingPage = (): ReactElement => {
  const { updateQueue, userData } = useUserData();
  const router = useRouter();
  const { dispatch } = useContext(AuthContext);
  const loginPageEnabled = process.env.FEATURE_LOGIN_PAGE === "true";
  const profileNJLoginEnabled = process.env.FEATURE_PROFILE_NJ_LOGIN === "true";
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowError(true);
    }, 5000);

    return (): void => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    /**
     * For client-side rendering of the Next.js router, the `query` property
     * is first initialized as an empty object. This `isReady` check ensures
     * we don't have false negatives when checking `router.query`.
     */
    if (!router?.isReady) {
      return;
    }

    const logInReturningUser = async (): Promise<void> => {
      const currentUser = await getActiveUser();
      await ensureProfileNJUserRecord(currentUser, {
        getUserData: api.getUserData,
        postUserData: api.postUserData,
        getGuestUserData: () => UserDataStorageFactory().getCurrentUserData(),
      });
      dispatch({ type: "LOGIN", activeUser: currentUser });
    };

    if (router.query[QUERIES.code]) {
      logInReturningUser().catch((error: unknown) => {
        console.error("Failed to complete sign-in", error);
        setShowError(true);
      });
    } else if (router?.asPath?.includes(signInSamlError)) {
      analytics.event.landing_page.arrive.get_unlinked_myNJ_account();
      setShowError(true);
    } else if (profileNJLoginEnabled && router.query.error) {
      setShowError(true);
    } else {
      if (loginPageEnabled) {
        router.push(ROUTES.login);
      } else {
        triggerSignIn();
      }
    }
  }, [router, dispatch, loginPageEnabled, profileNJLoginEnabled]);

  useMountEffectWhenDefined(() => {
    if (!updateQueue) return;
    const business = updateQueue.currentBusiness();
    if (business?.onboardingFormProgress && !onboardingCompleted(business)) {
      router && router.push({ pathname: ROUTES.onboarding, query: router.query });
    } else if (business.preferences.returnToLink) {
      const pageLink = business.preferences.returnToLink;
      updateQueue
        .queuePreferences({ returnToLink: "" })
        .update()
        .then(() => {
          router && router.push(pageLink);
        })
        .catch(() => undefined);
    } else {
      updateQueue
        .update()
        .then(() => {
          router && router.push(ROUTES.dashboard);
        })
        .catch(() => undefined);
    }
  }, userData);

  return (
    <LoadingPageComponent
      hasError={showError}
      isLinkingError={router?.asPath?.includes(signInSamlError) ?? false}
    />
  );
};

export function getStaticProps(): GetStaticPropsResult<{ noAuth: boolean }> {
  return {
    props: { noAuth: true },
  };
}

export default LoadingPage;
