import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { PageFooter } from "@/components/PageFooter";
import { SkipToMainContent } from "@/components/SkipToMainContent";
import { NavBar } from "@/components/navbar/NavBar";
import { Banner } from "@/components/njwds/Banner";
import { NavPageTypeEnums, Task } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  pageType?: NavPageTypeEnums;
  children: React.ReactNode;
  showNavBar?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  previousBusinessId?: string | undefined;
}

export const PageSkeleton = (props: Props): ReactElement => {
  const landingPage = props.pageType === "LANDING_PAGE";

  return (
    <>
      <section aria-label="Official government website">
        {!landingPage && <SkipToMainContent />}
        <Banner />
      </section>
      <div className="fit-screen-content">
        {props.showNavBar && (
          <NavBar
            pageType={props.pageType}
            task={props.task}
            showSidebar={props.showSidebar}
            hideMiniRoadmap={props.hideMiniRoadmap}
            previousBusinessId={props.previousBusinessId}
          />
        )}
        {props.children}
      </div>
      <footer>
        {!landingPage && (
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
