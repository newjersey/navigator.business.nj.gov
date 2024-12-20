import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { NavBarVerticalLine } from "@/components/navbar/NavBarVerticalLine";
import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { NavBarMobileWrapper } from "@/components/navbar/mobile/NavBarMobileWrapper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  showMyNjLogo: boolean;
  scrolled: boolean;
}

export const NavBarLogoOnlyMobile = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  return (
    <NavBarMobileWrapper scrolled={props.scrolled}>
      <div className="display-flex flex-row flex-align-center usa-logo">
        <NavbarBusinessNjGovLogo />
        <div className="margin-x-105">
          <NavBarVerticalLine />
        </div>
        <NavBarDashboardLink linkText={Config.navigationDefaults.navBarMyAccountText} />
        {props.showMyNjLogo && (
          <div className={`display-flex flex-col flex-align-center margin-left-2`}>
            <img className="height-4" src="/img/mynj-logo.png" alt="myNewJersey" />
          </div>
        )}
      </div>
    </NavBarMobileWrapper>
  );
};
