import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { MediaQueries } from "@/lib/PageSizes";
import { Task } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ROUTES } from "@/lib/domain-logic/routes";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "@/contexts/authContext";

type Props = {
  landingPage?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  previousBusinessId?: string | undefined;
};

export const NavBar = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [scrolled, setScrolled] = useState(false);

  const { state } = useContext(AuthContext);
  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);


  const router = useRouter();

  const handleScroll = (): void => {
    const offset = window.scrollY;
    if (offset > 108) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const currentlyOnboarding = (): boolean => {
    if (!router) {
      return false;
    }
    return router.pathname === ROUTES.onboarding;
  };


  if (isLargeScreen) {
    return (
      <NavBarDesktop
        isLanding={props.landingPage}
        logoOnlyType={props.logoOnly}
        previousBusinessId={props.previousBusinessId}
        currentlyOnboarding={currentlyOnboarding()}
        isAuthenticated={isAuthenticated}
      />
    );
  } else {
    return (
      <>
        <NavBarMobile
          scrolled={scrolled}
          task={props.task}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          isLanding={props.landingPage}
          previousBusinessId={props.previousBusinessId}
          logoOnlyType={props.logoOnly}
          currentlyOnboarding={currentlyOnboarding()}
          isAuthenticated={isAuthenticated}
        />
        <div className={scrolled ? "padding-top-6" : ""} />
      </>
    );
  }
};
