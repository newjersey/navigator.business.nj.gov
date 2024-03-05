import { ReactElement, ReactNode } from "react";

interface NavBarDesktopWrapperProps {
  children: ReactNode;
}

export const NavBarDesktopWrapper = (props: NavBarDesktopWrapperProps): ReactElement => {
  return (
    <div className="position-sticky top-0 z-500 bg-white">
      <nav aria-label="Primary" className="grid-container-widescreen desktop:padding-x-7">
        <div className="display-flex flex-row flex-justify flex-align-center height-8">{props.children}</div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
