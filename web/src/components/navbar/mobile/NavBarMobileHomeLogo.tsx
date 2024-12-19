import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { NavBarVerticalLine } from "@/components/navbar/NavBarVerticalLine";
import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isLoginPage?: boolean;
  scrolled: boolean;
  showSidebar: boolean | undefined;
  previousBusinessId: string | undefined;
  businessNavBarTitle: string;
}

export const NavBarMobileHomeLogo = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div className={`usa-logo ${props.scrolled ? "bg-white" : ""}`}>
      <div className={"display-flex flex-align-center"}>
        <div className={props.showSidebar ? "width-15" : ""}>
          <NavbarBusinessNjGovLogo />
        </div>
        <div className="margin-x-105">
          <NavBarVerticalLine />
        </div>
        <div>
          {props.isLoginPage ? (
            <span className="my-acccount-login-text font-body-sm">My Account</span>
          ) : (
            <NavBarDashboardLink
              className={props.showSidebar ? "truncate-long-business-names_NavBarMobile" : ""}
              linkText={
                props.showSidebar ? props.businessNavBarTitle : Config.navigationDefaults.navBarMyAccountText
              }
              previousBusinessId={props.previousBusinessId}
            />
          )}
        </div>
      </div>
    </div>
  );
};
