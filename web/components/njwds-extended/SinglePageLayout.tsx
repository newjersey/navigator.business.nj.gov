import React, { ReactElement } from "react";
import { MobilePageTitle } from "../njwds/MobilePageTitle";
import { SingleColumnContainer } from "../njwds/SingleColumnContainer";

interface Props {
  children: React.ReactNode;
  mobilePageTitle?: ReactElement;
}

export const SinglePageLayout = (props: Props): ReactElement => {
  return (
    <>
      <MobilePageTitle>{props.mobilePageTitle}</MobilePageTitle>
      <main className="usa-section padding-bottom-15">
        <SingleColumnContainer>{props.children}</SingleColumnContainer>
      </main>
    </>
  );
};
