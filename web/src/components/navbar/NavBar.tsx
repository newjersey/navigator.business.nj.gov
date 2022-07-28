import { NavBarDesktop } from "@/components/navbar/NavBarDesktop";
import { NavBarLanding } from "@/components/navbar/NavBarLanding";
import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
import { NavBarMobile } from "@/components/navbar/NavBarMobile";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference, Task } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  landingPage?: boolean;
  task?: Task;
  sidebarPageLayout?: boolean;
  operateReferences?: Record<string, OperateReference>;
  logoOnly?: boolean;
};

export const NavBar = (props: Props): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [scrolled, setScrolled] = useState(false);

  const handleScroll = () => {
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
  } else if (props.landingPage) {
    return <NavBarLanding />;
  } else if (isLargeScreen) {
    return <NavBarDesktop />;
  } else {
    return (
      <>
        <NavBarMobile
          scrolled={scrolled}
          task={props.task}
          sidebarPageLayout={props.sidebarPageLayout}
          operateReferences={props.operateReferences}
        />
        <div className={!isLargeScreen && scrolled ? "padding-top-6" : ""} />
      </>
    );
  }
};
