import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { NavPageTypeEnums, Task } from "@/lib/types/types";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";

type Props = {
  pageType?: NavPageTypeEnums;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  previousBusinessId?: string | undefined;
};

export const NavBar = (props: Props): ReactElement => {
  const [scrolled, setScrolled] = useState(false);
  const { userData } = useUserData();

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
    return (): void => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const currentlyOnboarding = (): boolean => {
    return router?.pathname === ROUTES.onboarding;
  };

  return (
    <>
      <div className="display-none desktop:display-inline">
        <NavBarDesktop
          pageType={currentlyOnboarding() ? "ONBOARDING" : props.pageType}
          previousBusinessId={props.previousBusinessId}
          isAuthenticated={isAuthenticated}
          userData={userData}
        />
      </div>
      <div className="display-inline desktop:display-none">
        <NavBarMobile
          pageType={currentlyOnboarding() ? "ONBOARDING" : props.pageType}
          scrolled={scrolled}
          task={props.task}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          previousBusinessId={props.previousBusinessId}
          isAuthenticated={isAuthenticated}
          userData={userData}
        />
        <div className={scrolled ? "padding-top-6" : ""} />
      </div>
    </>
  );
};
