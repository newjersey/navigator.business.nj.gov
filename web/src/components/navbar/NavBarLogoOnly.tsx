import { NavigatorLogo } from "@/components/navbar/NavigatorLogo";
import { ReactElement } from "react";

export const NavBarLogoOnly = (): ReactElement => {
  return (
    <>
      <nav aria-label="Primary" className="grid-container-widescreen desktop:padding-x-7">
        <div className="display-flex flex-row flex-justify flex-align-center height-8">
          <NavigatorLogo />
        </div>
      </nav>
      <hr className="margin-0" />
    </>
  );
};
