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
    >
      {props.children}
    </nav>
  );
};
