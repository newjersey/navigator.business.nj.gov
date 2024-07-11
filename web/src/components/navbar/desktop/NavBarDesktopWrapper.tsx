import { OutageAlertBar } from "@/components/OutageAlertBar";
import { NAVBAR_WRAPPER_DESKTOP_ID } from "@/lib/utils/helpers";
import { ReactElement, ReactNode } from "react";

interface NavBarDesktopWrapperProps {
  children: ReactNode;
  CMS_ONLY_disableSticky?: boolean;
}

export const NavBarDesktopWrapper = (props: NavBarDesktopWrapperProps): ReactElement => {
  return (
    <div
      className={`${props.CMS_ONLY_disableSticky ? "" : "position-sticky"} top-0 z-500 bg-white`}
      id={NAVBAR_WRAPPER_DESKTOP_ID}
    >
      <OutageAlertBar />
      <nav aria-label="Primary" className="grid-container-widescreen desktop:padding-x-7">
        <div className="display-flex flex-row flex-justify flex-align-center height-8">{props.children}</div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
