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
        <div
          className={`display-flex flex-row ${
            useSmall ? "flex-column height-13 padding-y-1" : "height-8 flex-align-center"
          }`}
        >
          <div className="display-flex flex-row flex-align-center">
            <NavbarBusinessNjGovLogo />
            <div className="margin-x-105">
              <NavBarVerticalLine />
            </div>
            <NavBarDashboardLink linkText={Config.navigationDefaults.navBarMyAccountText} />
            {props.logoType === "NAVIGATOR_MYNJ_LOGO" && (
              <div
                className={`display-flex flex-col flex-align-center margin-left-2 ${
                  !useSmall &&
                  "border-base-lighter border-left-2px border-left-solid margin-left-2 padding-left-2"
                }`}
              >
                <img className="height-4" src="/img/mynj-logo.png" alt="myNewJersey" />
              </div>
            )}
          </div>
        </div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
