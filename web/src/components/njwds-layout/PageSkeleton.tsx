import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { Banner } from "@/components/njwds/Banner";
import { PageFooter } from "@/components/PageFooter";
import { SkipToMainContent } from "@/components/SkipToMainContent";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  landingPage?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  return (
    <>
      <section aria-label="Official government website">
        {!props.landingPage && <SkipToMainContent />}
        <Banner />
      </section>
      <div className="fit-screen-content">{props.children}</div>
      <footer>
        {!props.landingPage && (
          <>
            <BetaBar />
            <LegalMessage />
          </>
        )}
        <PageFooter />
      </footer>
    </>
  );
};
