import { NAVBAR_WRAPPER_MOBILE_ID } from "@/lib/utils/helpers";
import { ReactElement, ReactNode } from "react";

interface NavBarMobileWrapperProps {
  children: ReactNode;
  scrolled: boolean;
}

export const NavBarMobileWrapper = (props: NavBarMobileWrapperProps): ReactElement => {
  return (
    <nav
      aria-label="Primary"
      className={`width-100 padding-y-05 usa-navbar ${
        props.scrolled ? "scrolled scrolled-transition bg-white" : ""
      }`}
      id={NAVBAR_WRAPPER_MOBILE_ID}
    >
      {props.children}
    </nav>
  );
};
