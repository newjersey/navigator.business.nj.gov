import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { NavBarVerticalLine } from "@/components/navbar/NavBarVerticalLine";
import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { MediaQueries } from "@/lib/PageSizes";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useMediaQuery } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  logoType: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO";
}

export const NavBarLogoOnly = (props: Props): ReactElement => {
  const isMobile = useMediaQuery(MediaQueries.isMobile);
  const useSmall = props.logoType === "NAVIGATOR_MYNJ_LOGO" && isMobile;
  const { Config } = useConfig();
  return (
    <div className="position-sticky top-0 z-500 bg-white">
      <nav aria-label="Primary" className="grid-container-widescreen desktop:padding-x-7">
        <div className={`display-flex flex-row flex-align-center ${useSmall ? "height-6" : "height-8"}`}>
          <div className="display-flex flex-row flex-align-center">
            <NavbarBusinessNjGovLogo />
            <div className="margin-x-105">
              <NavBarVerticalLine />
            </div>
            <NavBarDashboardLink linkText={Config.navigationDefaults.navBarMyAccountText} />
          </div>
          {props.logoType === "NAVIGATOR_MYNJ_LOGO" && (
            <div className="display-flex flex-row flex-align-center border-base-darkest border-left-2px border-left-solid margin-left-2 padding-left-2">
              <img
                className={isMobile ? "height-3" : "height-4"}
                src="/img/mynj-logo.png"
                alt="myNewJersey"
              />
            </div>
          )}
        </div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
