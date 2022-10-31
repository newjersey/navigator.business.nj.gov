import { Content } from "@/components/Content";
import { LoadingIndicator } from "@/components/LoadingIndicator";
import { ModalOneButton } from "@/components/ModalOneButton";
import { NavBar } from "@/components/navbar/NavBar";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AuthContext } from "@/contexts/authContext";
import { getCurrentUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { onGuestSignIn } from "@/lib/auth/signinHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { QUERIES, ROUTES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { onboardingCompleted } from "@businessnjgovnavigator/shared/domain-logic/onboarding";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect, useState } from "react";

export const signInSamlError = "Name+ID+value+was+not+found+in+SAML";

const LoadingPage = (): ReactElement => {
  const { userData, update } = useUserData();
  const router = useRouter();
  const { dispatch } = useContext(AuthContext);
  const [showLoginErrorModal, setShowLoginErrorModal] = useState<boolean>(false);
  const [redirectIsLoading, setRedirectIsLoading] = useState<boolean>(false);
  const { Config } = useConfig();

  useEffect(() => {
    if (!router.isReady) {
      return;
    }
    if (router.query[QUERIES.code]) {
      getCurrentUser().then((currentUser) => {
        dispatch({ type: "LOGIN", user: currentUser });
      });
    } else if (router.asPath.includes(signInSamlError)) {
      setShowLoginErrorModal(true);
    } else {
      triggerSignIn();
    }
  }, [router, dispatch]);

  useMountEffectWhenDefined(() => {
    if (!userData) {
      return;
    }
    if (!onboardingCompleted(userData)) {
      router.push(ROUTES.onboarding);
    } else if (userData.preferences.returnToLink) {
      const pageLink = userData.preferences.returnToLink;
      update({ ...userData, preferences: { ...userData.preferences, returnToLink: "" } }).then(() => {
        router.push(pageLink);
      });
    } else {
      router.push(ROUTES.dashboard);
    }
  }, userData);

  const sendToOnboarding = async () => {
    setRedirectIsLoading(true);
    onGuestSignIn(router.push, router.pathname, dispatch).then(() => {
      return setRedirectIsLoading(false);
    });
  };

  return (
    <PageSkeleton>
      <NavBar logoOnly={true} />
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <div className="margin-top-6">{!showLoginErrorModal && <LoadingIndicator />}</div>
        </SingleColumnContainer>
        <ModalOneButton
          isOpen={showLoginErrorModal}
          close={() => {
            return setShowLoginErrorModal(false);
          }}
          title={Config.selfRegistration.loginErrorModalTitle}
          primaryButtonText={Config.selfRegistration.loginErrorModalContinueButton}
          primaryButtonOnClick={sendToOnboarding}
          isLoading={redirectIsLoading}
          uncloseable
        >
          <Content>{Config.selfRegistration.loginErrorModalBody}</Content>
        </ModalOneButton>
      </main>
    </PageSkeleton>
  );
};

export async function getStaticProps() {
  return {
    props: { noAuth: true },
  };
}

export default LoadingPage;
