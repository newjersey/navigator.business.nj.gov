import React, { ReactElement } from "react";
import { Banner } from "@/components/njwds/Banner";
import { BetaBar } from "@/components/BetaBar";
import { InnovFooter } from "@/components/InnovFooter";
import { LegalMessage } from "@/components/LegalMessage";
import { SingleColumnContainer } from "./njwds/SingleColumnContainer";

interface Props {
  children: React.ReactNode;
  home?: boolean;
  showLegalMessage?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <Banner />
      <BetaBar />
      <div className="fit-screen-content">{props.children}</div>
      {props.showLegalMessage && (
        <div className="bg-base-lighter text-justify" role="banner">
          <SingleColumnContainer>
            <div className="padding-y-2 line-height-body-2">
              <LegalMessage />
            </div>
          </SingleColumnContainer>
        </div>
      )}
      <InnovFooter />
    </>
  );
};
