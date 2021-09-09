import React, { ReactElement } from "react";
import { MobilePageTitle } from "@/components/njwds/MobilePageTitle";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";

interface Props {
  children: React.ReactNode;
  mobilePageTitle?: ReactElement;
}

export const SinglePageLayout = (props: Props): ReactElement => {
  return (
    <>
      <MobilePageTitle>{props.mobilePageTitle}</MobilePageTitle>
      <main className="usa-section padding-top-0 desktop:padding-top-6 padding-bottom-15" id="main">
        <SingleColumnContainer>{props.children}</SingleColumnContainer>
      </main>
    </>
  );
};
