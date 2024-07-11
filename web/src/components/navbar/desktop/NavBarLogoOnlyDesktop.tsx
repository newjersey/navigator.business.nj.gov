import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { NavBarVerticalLine } from "@/components/navbar/NavBarVerticalLine";
import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { NavBarDesktopWrapper } from "@/components/navbar/desktop/NavBarDesktopWrapper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  logoType: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO";
}

export const NavBarLogoOnlyDesktop = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <NavBarDesktopWrapper>
      <div className="display-flex flex-row flex-align-center">
        <NavbarBusinessNjGovLogo />
        <div className="margin-x-105">
          <NavBarVerticalLine />
        </div>
        <NavBarDashboardLink linkText={Config.navigationDefaults.navBarMyAccountText} />
        {props.logoType === "NAVIGATOR_MYNJ_LOGO" && (
          <div
            className={
              "display-flex flex-col flex-align-center margin-left-2 border-base-lighter border-left-2px border-left-solid margin-left-2 padding-left-2"
            }
          >
            <img className="height-4" src="/img/mynj-logo.png" alt="myNewJersey" />
          </div>
        )}
      </div>
    </NavBarDesktopWrapper>
  );
};
