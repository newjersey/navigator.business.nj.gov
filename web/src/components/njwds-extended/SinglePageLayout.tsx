import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  wrappedWithMain?: boolean;
}

export const SinglePageLayout = ({ children, wrappedWithMain = true }: Props): ReactElement => {
  const el = (
    <div
      data-testid="SPL-div-ele"
      className="usa-section padding-top-0 desktop:padding-top-6 padding-bottom-15"
    >
      <SingleColumnContainer>{children}</SingleColumnContainer>
    </div>
  );
  if (!wrappedWithMain) return el;

  return (
    <main id="main" data-testid="SPL-main-ele">
      {el}
    </main>
  );
};
