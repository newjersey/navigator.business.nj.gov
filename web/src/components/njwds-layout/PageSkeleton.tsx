import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { PageFooter } from "@/components/PageFooter";
import { SkipToMainContent } from "@/components/SkipToMainContent";
import { NavBar } from "@/components/navbar/NavBar";
import { Banner } from "@/components/njwds/Banner";
import { Task } from "@businessnjgovnavigator/shared/types";
import React, { ReactElement } from "react";

interface Props {
  children: React.ReactNode;
  landingPage?: boolean;
  isLoginPage?: boolean;
  isSeoStarterKit?: boolean;
  showNavBar?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  previousBusinessId?: string | undefined;
}

export const PageSkeleton = (props: Props): ReactElement => {
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
            isLoginPage={props.isLoginPage}
            isSeoStarterKit={props.isSeoStarterKit}
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
