import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { Banner } from "@/components/njwds/Banner";
import { OutageAlertBar } from "@/components/OutageAlertBar";
import { PageFooter } from "@/components/PageFooter";
import { ReportAnIssueBar } from "@/components/ReportAnIssueBar";
import { SkipToMainContent } from "@/components/SkipToMainContent";
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
        {!props.landingPage && <SkipToMainContent />}
        <Banner />
        <OutageAlertBar />
        <BetaBar />
      </section>
      <div className="fit-screen-content">{props.children}</div>
      <footer>
        {business?.onboardingFormProgress === "COMPLETED" && <ReportAnIssueBar />}
        {!props.landingPage && <LegalMessage />}
        <PageFooter />
      </footer>
    </>
  );
};
