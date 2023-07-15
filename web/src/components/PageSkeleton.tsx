import { BetaBar } from "@/components/BetaBar";
import { InnovFooter } from "@/components/InnovFooter";
import { LegalMessage } from "@/components/LegalMessage";
import { Banner } from "@/components/njwds/Banner";
import { OutageAlertBar } from "@/components/OutageAlertBar";
import { ReportAnIssueBar } from "@/components/ReportAnIssueBar";
import { useUserData } from "@/lib/data-hooks/useUserData";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  landingPage?: boolean;
}

export const PageSkeleton = (props: Props): ReactElement => {
  const { business } = useUserData();

  return (
    <>
      <section aria-label="Official government website">
        {!props.landingPage && (
          <div>
            <a className="skip-link" href="#main">
              Skip to main content
            </a>
          </div>
        )}
        <Banner />
        <OutageAlertBar />
        <BetaBar />
      </section>
      <div className="fit-screen-content">{props.children}</div>
      <footer>
        {business?.onboardingFormProgress === "COMPLETED" && <ReportAnIssueBar />}
        {!props.landingPage && <LegalMessage />}
        <InnovFooter />
      </footer>
    </>
  );
};
