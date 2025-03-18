import { LoadingPageComponent } from "@/components/LoadingPageComponent";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import * as api from "@/lib/api-client/apiClient";
import { getActiveUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { AccountLinkingErrorStorageFactory } from "@/lib/storage/AccountLinkingErrorStorage";
import analytics from "@/lib/utils/analytics";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { createEmptyUserData, onboardingCompleted } from "@businessnjgovnavigator/shared/";
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
    
    const { state } = useContext(AuthContext);
    const { setRegistrationStatus } = useContext(NeedsAccountContext);
    
    // If we have a user from myNJ auth but no userData record, create minimal record and redirect to consent form
    if (state.isAuthenticated && state.activeUser && !userData) {
      // Store source for attribution and redirect return
      const source = router?.query?.source || '';
      const referrer = router?.query?.referrer || '';
      
      // Create a minimal user data record with only identity information
      // No consent assumed for newsletter, data sharing, etc.
      const minimalUserData = createEmptyUserData({
        myNJUserKey: state.activeUser.id,
        email: state.activeUser.email,
        id: state.activeUser.id,
        name: state.activeUser.name || "",
        externalStatus: {},
        // Leave consent fields undefined to require explicit user decision
        receiveNewsletter: undefined,
        userTesting: undefined,
        // Don't hardcode AB experience, let the system determine it
        abExperience: undefined,
        // Track the source if available, otherwise undefined
        accountCreationSource: source ? String(source) : undefined,
        // Leave consent fields undefined to require explicit user decision
        contactSharingWithAccountCreationPartner: undefined,
      });
      
      // Preserve the link to myNJ identity
      api
        .postSelfReg(minimalUserData)
        .then(async (response) => {
          // Update the queue with the response user data
          await updateQueue.queue(response.userData).update();
          
          // If needed, handle the account linking error
          if (state.activeUser?.encounteredMyNjLinkingError) {
            AccountLinkingErrorStorageFactory().setEncounteredMyNjLinkingError(true);
          }
          
          // Redirect to account setup to collect consent information
          // Pass source and referrer if available for attribution
          const queryParams = new URLSearchParams();
          if (source) queryParams.append('source', String(source));
          if (referrer) queryParams.append('referrer', String(referrer));
          
          const setupUrl = `${ROUTES.accountSetup}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
          router && router.push(setupUrl);
        })
        .catch((error) => {
          console.error("Self-registration failed:", error);
          if (error === 409) {
            setRegistrationStatus("DUPLICATE_ERROR");
          } else {
            setRegistrationStatus("RESPONSE_ERROR");
          }
          // Redirect to account setup for manual registration
          router && router.push(ROUTES.accountSetup);
        });
    } else if (userData) {
      // Normal flow for users with existing data
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
