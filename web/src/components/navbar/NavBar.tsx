import { NavBarDesktop } from "@/components/navbar/desktop/NavBarDesktop";
import { NavBarMobile } from "@/components/navbar/mobile/NavBarMobile";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@businessnjgovnavigator/shared/types";
import { ReactElement, useEffect, useState } from "react";

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
  variant: NavBarVariant;
  logoVariant?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  previousBusinessId?: string | undefined;
};

export const NavBar = (props: Props): ReactElement => {
  const [scrolled, setScrolled] = useState(false);
  const { userData } = useUserData();

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

  return (
    <>
      <div className="display-none desktop:display-inline">
        <NavBarDesktop
          variant={props.variant}
          logoVariant={props.logoVariant}
          previousBusinessId={props.previousBusinessId}
          userData={userData}
        />
      </div>
      <div className="display-inline desktop:display-none">
        <NavBarMobile
          variant={props.variant}
          logoVariant={props.logoVariant}
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
