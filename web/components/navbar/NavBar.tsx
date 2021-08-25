import React, { ReactElement, useEffect, useState } from "react";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";
import { NavBarLanding } from "@/components/navbar/NavBarLanding";
import { NavBarLoggedIn } from "@/components/navbar/NavBarLoggedIn";
import { Task } from "@/lib/types/types";

type Props = {
  landingPage?: boolean;
  task?: Task;
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
          <div className={!isLargeScreen && scrolled ? "scrolled-padding-3rem" : ""} />
        </>
      )}

      {!landingPage && (
        <>
          <NavBarLoggedIn scrolled={scrolled} isLargeScreen={isLargeScreen} task={task} />
          <div className={!isLargeScreen && scrolled ? "scrolled-padding-3rem" : ""} />
        </>
      )}
    </>
  );
};
