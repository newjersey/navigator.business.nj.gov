import { NavBar } from "@/components/navbar/NavBar";
import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { ROUTES } from "@/lib/domain-logic/routes";
import { STARTER_KITS_GENERIC_SLUG } from "@/lib/utils/starterKits";
import { GetServerSideProps } from "next";
import { ReactElement } from "react";

const StarterKitsRootPage = (): ReactElement => {
  return (
    <PageSkeleton landingPage={true}>
      <NavBar isSeoStarterKit={true} />
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
