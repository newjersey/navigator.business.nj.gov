import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { PageFooter } from "@/components/PageFooter";
import { SkipToMainContent } from "@/components/SkipToMainContent";
import { NavBar } from "@/components/navbar/NavBar";
import { Banner } from "@/components/njwds/Banner";
import { Task } from "@/lib/types/types";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  landingPage?: boolean;
  showNavBar?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  previousBusinessId?: string | undefined;
}

export const PageSkeleton = (props: Props): ReactElement<any> => {
  return (
    <>
      <section aria-label="Official government website">
        {!props.landingPage && <SkipToMainContent />}
        <Banner />
      </section>
      <div className="fit-screen-content">
        {props.showNavBar && (
          <NavBar
            landingPage={props.landingPage}
            task={props.task}
            showSidebar={props.showSidebar}
            hideMiniRoadmap={props.hideMiniRoadmap}
            logoOnly={props.logoOnly}
            previousBusinessId={props.previousBusinessId}
          />
        )}
        {props.children}
      </div>
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
