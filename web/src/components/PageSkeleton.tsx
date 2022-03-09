import { BetaBar } from "@/components/BetaBar";
import { InnovFooter } from "@/components/InnovFooter";
import { LegalMessage } from "@/components/LegalMessage";
import { Banner } from "@/components/njwds/Banner";
import { SingleColumnContainer } from "@/components/njwds/SingleColumnContainer";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  home?: boolean;
  showLegalMessage?: boolean;
  isWidePage?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <section aria-label="Official government website">
        {!props.home && (
          <div>
            <a className="skip-link" href="#main">
              Skip to main content
            </a>
          </div>
        )}
        <Banner isWidePage={props.isWidePage} />
        <BetaBar />
      </section>
      <div className="fit-screen-content">{props.children}</div>
      <footer>
        {props.showLegalMessage && (
          <div className="bg-base-lightest text-justify">
            <SingleColumnContainer>
              <div className="padding-y-2 line-height-body-2">
                <LegalMessage />
              </div>
            </SingleColumnContainer>
          </div>
        )}
        <InnovFooter />
      </footer>
    </>
  );
};
