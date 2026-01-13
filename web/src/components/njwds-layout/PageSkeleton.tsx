import { BetaBar } from "@/components/BetaBar";
import { LegalMessage } from "@/components/LegalMessage";
import { PageFooter } from "@/components/PageFooter";
import { SkipToMainContent } from "@/components/SkipToMainContent";
import { NavBar, NavBarVariant } from "@/components/navbar/NavBar";
import { Banner } from "@/components/njwds/Banner";
import { AuthContext } from "@/contexts/authContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Task } from "@businessnjgovnavigator/shared/types";
import { useRouter } from "next/compat/router";
import React, { ReactElement, useContext, useMemo } from "react";

interface Props {
  children: React.ReactNode;
  variant?: NavBarVariant;
  landingPage?: boolean;
  isLoginPage?: boolean;
  isSeoStarterKit?: boolean;
  showNavBar?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  logoVariant?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  previousBusinessId?: string | undefined;
}

export const PageSkeleton = (props: Props): ReactElement => {
  const { state } = useContext(AuthContext);
  const router = useRouter();

  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);

  const currentlyOnboarding = (): boolean => {
    return router?.pathname === ROUTES.onboarding;
  };

  const deriveVariant = (): NavBarVariant => {
    // If variant explicitly provided, use it
    if (props.variant) return props.variant;

    // Otherwise derive from boolean props or context
    if (props.logoOnly) return NavBarVariant.LOGO_ONLY;
    if (props.isLoginPage) return NavBarVariant.LOGO_WITH_TEXT;
    if (props.isSeoStarterKit) return NavBarVariant.MINIMAL_WITH_LOGIN;
    if (props.landingPage) return NavBarVariant.FULL_LANDING;
    if (currentlyOnboarding()) return NavBarVariant.MINIMAL_WITH_DISABLED_DROPDOWN;
    if (isAuthenticated) return NavBarVariant.FULL_AUTHENTICATED;
    return NavBarVariant.FULL_GUEST;
  };

  const logoVariant = props.logoVariant ?? props.logoOnly;

  return (
    <>
      <section aria-label="Official government website">
        {!props.landingPage && <SkipToMainContent />}
        <Banner />
      </section>
      <div className="fit-screen-content">
        {props.showNavBar && (
          <NavBar
            variant={deriveVariant()}
            logoVariant={logoVariant}
            task={props.task}
            showSidebar={props.showSidebar}
            hideMiniRoadmap={props.hideMiniRoadmap}
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
