import { NavBarDesktop } from "@/components/navbar/NavBarDesktop";
import { NavBarLanding } from "@/components/navbar/NavBarLanding";
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
};

export const NavBar = (props: Props): ReactElement => {
  const { landingPage, task, operateReferences, sidebarPageLayout } = props;
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const isTabletScreen = useMediaQuery(MediaQueries.tabletAndUp);
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

  return (
    <>
      {landingPage && isTabletScreen && <NavBarLanding />}

      {!landingPage && isLargeScreen && <NavBarDesktop />}

      {!landingPage && !isLargeScreen && (
        <>
          <NavBarMobile
            scrolled={scrolled}
            task={task}
            sidebarPageLayout={sidebarPageLayout}
            operateReferences={operateReferences}
          />
          <div className={!isLargeScreen && scrolled ? "padding-top-6" : ""} />
        </>
      )}
    </>
  );
};
