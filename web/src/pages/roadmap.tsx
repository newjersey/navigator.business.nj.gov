import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { AuthContext } from "@/contexts/authContext";
import { IsAuthenticated } from "@/lib/auth/AuthContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { useRouter } from "next/router";
import { ReactElement, useContext, useEffect } from "react";

const RoadmapPage = (): ReactElement => {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (state.isAuthenticated === IsAuthenticated.TRUE) {
      router.replace(ROUTES.dashboard);
    } else if (state.isAuthenticated === IsAuthenticated.FALSE) {
      router.replace(ROUTES.landing);
    }
  }, [router, state.isAuthenticated]);

  return (
    <PageSkeleton showNavBar logoOnly="NAVIGATOR_LOGO">
      <main className="usa-section padding-top-0 desktop:padding-top-8" id="main">
        <SingleColumnContainer>
          <PageCircularIndicator />
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export default RoadmapPage;
