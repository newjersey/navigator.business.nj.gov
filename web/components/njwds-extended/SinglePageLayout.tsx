import React, { ReactElement } from "react";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";

interface Props {
  children: React.ReactNode;
}

export const SinglePageLayout = (props: Props): ReactElement => {
  return (
    <>
      <main className="usa-section padding-top-0 desktop:padding-top-6 padding-bottom-15" id="main">
        <SingleColumnContainer>{props.children}</SingleColumnContainer>
      </main>
    </>
  );
};
