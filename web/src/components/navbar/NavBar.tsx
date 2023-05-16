import { NavBarDesktop } from "@/components/navbar/NavBarDesktop";
import { NavBarLandingDesktop } from "@/components/navbar/NavBarLandingDesktop";
import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
import { NavBarMobile } from "@/components/navbar/NavBarMobile";
import { MediaQueries } from "@/lib/PageSizes";
import { Task } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  landingPage?: boolean;
  task?: Task;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  logoOnly?: boolean;
};

export const NavBar = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [scrolled, setScrolled] = useState(false);

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

  if (props.logoOnly) {
    return <NavBarLogoOnly />;
  } else if (props.landingPage && isLargeScreen) {
    return <NavBarLandingDesktop />;
  } else if (isLargeScreen) {
    return <NavBarDesktop />;
  } else {
    return (
      <>
        <NavBarMobile
          scrolled={scrolled}
          task={props.task}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          isLanding={props.landingPage}
        />
        <div className={scrolled ? "padding-top-6" : ""} />
      </>
    );
  }
};
