import React, { ReactElement, useEffect, useState } from "react";
import { NavDefaults } from "@/display-content/NavDefaults";
import { Signup } from "@/components/Signup";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { MediaQueries } from "@/lib/PageSizes";
import { useMediaQuery } from "@material-ui/core";

export const NavBarLanding = (): ReactElement => {
  const isLargeScreen = useMediaQuery(MediaQueries.desktopAndUp);
  const [signupIsOpen, setSignupIsOpen] = React.useState<boolean>(false);
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
  });

  return (
    <div
      className={`grid-container width-100 padding-top-05 ${
        !isLargeScreen && scrolled ? "scrolled scrolled-transition bg-white-transparent" : ""
      }`}
    >
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">
          <header className="flex fac fjb">
            <div className="flex-custom">
              <img
                className="padding-top-1 logo-max-width"
                src="/img/Navigator-logo@2x.png"
                alt="Business.NJ.Gov Navigator"
              />
            </div>
            <div className="margin-left-auto flex fac">
              <span className="white-space-no-wrap padding-x-105">
                <button
                  onClick={triggerSignIn}
                  className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button"
                >
                  {" "}
                  {NavDefaults.itemOneText}
                </button>
              </span>
              <span className="white-space-no-wrap nav-padding-x">
                <button
                  onClick={() => {
                    setSignupIsOpen(true);
                  }}
                  className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button"
                >
                  {NavDefaults.itemTwoText}
                </button>{" "}
              </span>
            </div>
            <Signup isOpen={signupIsOpen} onClose={() => setSignupIsOpen(false)} />
          </header>
        </div>
      </div>
    </div>
  );
};
