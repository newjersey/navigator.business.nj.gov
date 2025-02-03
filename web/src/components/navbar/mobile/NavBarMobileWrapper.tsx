import { OutageAlertBar } from "@/components/OutageAlertBar";
import { NAVBAR_WRAPPER_MOBILE_ID } from "@/lib/utils/helpers";
import { ReactElement, ReactNode } from "react";

interface NavBarMobileWrapperProps {
  children: ReactNode;
  scrolled: boolean;
}

export const NavBarMobileWrapper = (props: NavBarMobileWrapperProps): ReactElement => {
  return (
    <div className={`bg-white ${props.scrolled ? "scrolled scrolled-transition" : ""}`}>
      <OutageAlertBar />
      <nav
        aria-label="Primary"
        className={`width-100 padding-y-05 usa-navbar `}
        id={NAVBAR_WRAPPER_MOBILE_ID}
      >
        {props.children}
      </nav>
    </div>
  );
};
