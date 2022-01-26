import { NavBarLanding } from "@/components/navbar/NavBarLanding";
import { NavBarLoggedInDesktop } from "@/components/navbar/NavBarLoggedInDesktop";
import { NavBarLoggedInMobile } from "@/components/navbar/NavBarLoggedInMobile";
import { MediaQueries } from "@/lib/PageSizes";
import { OperateReference, Task } from "@/lib/types/types";
import { useMediaQuery } from "@mui/material";
import React, { ReactElement, useEffect, useState } from "react";

type Props = {
  landingPage?: boolean;
  task?: Task;
  sideBarPageLayout?: boolean;
  operateReferences?: Record<string, OperateReference>;
};

export const NavBar = (props: Props): ReactElement => {
  const { landingPage, task } = props;
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

  return (
    <>
      {landingPage && (
        <>
          <NavBarLanding isLargeScreen={isLargeScreen} scrolled={scrolled} />
          <div className={!isLargeScreen && scrolled ? "padding-top-6" : ""} />
        </>
      )}

      {!landingPage && isLargeScreen && <NavBarLoggedInDesktop />}

      {!landingPage && !isLargeScreen && (
        <>
          <NavBarLoggedInMobile
            scrolled={scrolled}
            task={task}
            sideBarPageLayout={props.sideBarPageLayout}
            operateReferences={props.operateReferences}
          />
          <div className={!isLargeScreen && scrolled ? "padding-top-6" : ""} />
        </>
      )}
    </>
  );
};
