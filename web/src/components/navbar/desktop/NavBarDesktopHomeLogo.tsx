import { NavBarDashboardLink } from "@/components/navbar/NavBarDashboardLink";
import { NavBarVerticalLine } from "@/components/navbar/NavBarVerticalLine";
import { NavbarBusinessNjGovLogo } from "@/components/navbar/NavbarBusinessNjGovLogo";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  previousBusinessId?: string;
}

export const NavBarDesktopHomeLogo = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div className="display-flex flex-row flex-align-center">
      <NavbarBusinessNjGovLogo />
      <div className="margin-x-105">
        <NavBarVerticalLine />
      </div>
      <NavBarDashboardLink
        linkText={Config.navigationDefaults.navBarMyAccountText}
        previousBusinessId={props.previousBusinessId}
      />
    </div>
  );
};
