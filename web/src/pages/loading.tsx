import { LoadingIndicator } from "@/components/LoadingIndicator";
import { NavBar } from "@/components/navbar/NavBar";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/PageSkeleton";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useMountEffectWhenDefined } from "@/lib/utils/helpers";
import { onboardingCompleted } from "@businessnjgovnavigator/shared/domain-logic/onboarding";
import { useRouter } from "next/router";
import { ReactElement, useEffect } from "react";

const LoadingPage = (): ReactElement => {
  const { userData } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    if (!router.query.code) {
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

export default LoadingPage;
