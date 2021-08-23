import React, { ReactElement, useState } from "react";
import { Signup } from "@/components/Signup";
import { NavDefaults } from "@/display-content/NavDefaults";
import { triggerSignIn } from "@/lib/auth/sessionHelper";

type Props = {
  isLargeScreen: boolean;
  scrolled: boolean;
};

export const NavBarLanding = ({ isLargeScreen, scrolled }: Props): ReactElement => {
  const [signupIsOpen, setSignupIsOpen] = useState<boolean>(false);

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
              <span className="text-no-wrap padding-x-105">
                <button
                  onClick={triggerSignIn}
                  className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button"
                >
                  {" "}
                  {NavDefaults.logInButton}
                </button>
              </span>
              <span className="text-no-wrap nav-padding-x">
                <button
                  onClick={() => {
                    setSignupIsOpen(true);
                  }}
                  className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button"
                >
                  {NavDefaults.registerButton}
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
