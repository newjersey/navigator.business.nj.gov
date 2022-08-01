import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { initialState } from "@/contexts/authContext";
import { authReducer, AuthReducer } from "@/lib/auth/AuthContext";
import { getCurrentUser, triggerSignIn } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { onboardingCompleted } from "@businessnjgovnavigator/shared/domain-logic/onboarding";
import { useRouter } from "next/router";
import { ReactElement, useEffect, useReducer } from "react";

const LoadingPage = (): ReactElement => {
  const { userData } = useUserData();
  const router = useRouter();
  const [, dispatch] = useReducer<AuthReducer>(authReducer, initialState);

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.code) {
      getCurrentUser().then((currentUser) => {
        dispatch({ type: "LOGIN", user: currentUser });
      });
    } else {
      triggerSignIn();
    }
  }, [router]);

  useMountEffectWhenDefined(() => {
    if (!userData) return;
    if (!onboardingCompleted(userData)) {
      router.push(ROUTES.onboarding);
    } else {
      router.push(routeForPersona(userData.profileData.businessPersona));
    }
  }, userData);

  return (
    <PageSkeleton>
      <NavBar logoOnly={true} />
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <LoadingIndicator />
        </SingleColumnContainer>
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
