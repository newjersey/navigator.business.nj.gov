import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Task } from "@businessnjgovnavigator/shared/types";
import { useRouter } from "next/compat/router";
import { ReactElement, useContext, useEffect, useMemo, useState } from "react";

export enum NavBarVariant {
  LOGO_ONLY = "LOGO_ONLY",
  LOGO_WITH_TEXT = "LOGO_WITH_TEXT",
  MINIMAL_WITH_LOGIN = "MINIMAL_WITH_LOGIN",
  FULL_LANDING = "FULL_LANDING",
  MINIMAL_WITH_DISABLED_DROPDOWN = "MINIMAL_WITH_DISABLED_DROPDOWN",
  FULL_AUTHENTICATED = "FULL_AUTHENTICATED",
  FULL_GUEST = "FULL_GUEST",
}

type Props = {
  variant?: NavBarVariant;
  logoVariant?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  landingPage?: boolean;
  isLoginPage?: boolean;
  isSeoStarterKit?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
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

  const deriveVariant = (): NavBarVariant => {
    if (props.logoOnly) return NavBarVariant.LOGO_ONLY;
    if (props.isLoginPage) return NavBarVariant.LOGO_WITH_TEXT;
    if (props.isSeoStarterKit) return NavBarVariant.MINIMAL_WITH_LOGIN;
    if (props.landingPage) return NavBarVariant.FULL_LANDING;
    if (currentlyOnboarding()) return NavBarVariant.MINIMAL_WITH_DISABLED_DROPDOWN;
    if (isAuthenticated) return NavBarVariant.FULL_AUTHENTICATED;
    return NavBarVariant.FULL_GUEST;
  };

  const variant = props.variant ?? deriveVariant();
  const logoVariant = props.logoVariant ?? props.logoOnly;

  return (
    <>
      <div className="display-none desktop:display-inline">
        <NavBarDesktop
          variant={variant}
          logoVariant={logoVariant}
          previousBusinessId={props.previousBusinessId}
          userData={userData}
        />
      </div>
      <div className="display-inline desktop:display-none">
        <NavBarMobile
          variant={variant}
          logoVariant={logoVariant}
          scrolled={scrolled}
          task={props.task}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          previousBusinessId={props.previousBusinessId}
          userData={userData}
        />
        <div className={scrolled ? "padding-top-6" : ""} />
      </div>
    </>
  );
};
