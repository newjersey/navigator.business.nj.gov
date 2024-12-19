import { PageSkeleton } from "@/components/njwds-layout/PageSkeleton";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import { PageCircularIndicator } from "@/components/PageCircularIndicator";
import { ReactElement } from "react";

export const LoadingPageComponent = (): ReactElement<any> => {
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
