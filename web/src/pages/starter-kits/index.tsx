import type { GetServerSideProps } from "next";
import type { ReactElement } from "react";
import { NavBar } from "@/components/navbar/NavBar";
import { NavBarVariant } from "@/components/navbar/NavBarTypes";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { ROUTES } from "@/lib/domain-logic/routes";
import { STARTER_KITS_GENERIC_SLUG } from "@/lib/utils/starterKits";

const StarterKitsRootPage = (): ReactElement => {
  return (
    <PageSkeleton landingPage={true}>
      <NavBar variant={NavBarVariant.MINIMAL_WITH_LOGIN} />
      <main className="desktop:grid-container-widescreen desktop:padding-x-7">
        <SingleColumnContainer>
          <PageCircularIndicator />
        </SingleColumnContainer>
      </main>
    </PageSkeleton>
  );
};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: `${ROUTES.starterKits}/${STARTER_KITS_GENERIC_SLUG}`,
      permanent: true,
    },
  };
};

export default StarterKitsRootPage;
