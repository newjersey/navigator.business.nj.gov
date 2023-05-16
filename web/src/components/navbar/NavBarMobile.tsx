import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavigatorLogo } from "@/components/navbar/NavigatorLogo";
import { NavSidebarUserSettings } from "@/components/navbar/NavSidebarUserSettings";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useContext, useMemo, useState } from "react";
interface Props {
  scrolled: boolean;
  task?: Task;
  hideMiniRoadmap?: boolean;
  showSidebar?: boolean;
  isLanding?: boolean;
}

export const NavBarMobile = (props: Props): ReactElement => {
  const { userData } = useUserData();
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { state } = useContext(AuthContext);

  const open = (): void => {
    setSidebarIsOpen(true);
  };

  const close = (): void => {
    setSidebarIsOpen(false);
  };

  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);
  const userName = getUserNameOrEmail(userData);
  const textColor = isAuthenticated ? "primary" : "base";
  const accountIcon = isAuthenticated ? "account_circle" : "help";
  const accountString = isAuthenticated ? userName : Config.navigationDefaults.navBarGuestText;

  return (
    <>
      <div
        className={`left-nav-overlay ${sidebarIsOpen ? "is-visible" : ""}`}
        aria-hidden="true"
        onClick={(): void => {
          analytics.event.mobile_menu.click_outside.close_mobile_menu();
          close();
        }}
      />
      <nav
        aria-label="Primary"
        className={`width-100 padding-y-05 usa-navbar ${
          props.scrolled ? "scrolled scrolled-transition bg-white" : ""
        }`}
      >
        <button
          className="left-nav-menu-button radius-0"
          data-testid="nav-menu-open"
          aria-label="open menu"
          onClick={(): void => {
            analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
            open();
          }}
        >
          <Icon className="font-sans-xl">menu</Icon>
        </button>
        <div className={`usa-logo ${props.scrolled ? "bg-white" : ""}`}>
          {props.showSidebar ? (
            <div className="text-bold">{Config.navigationDefaults.taskPageNavBarHeading}</div>
          ) : (
            <NavigatorLogo />
          )}
        </div>
      </nav>
      <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
        <nav
          aria-label="Secondary"
          className={`left-nav ${sidebarIsOpen ? "is-visible" : "is-hidden"} `}
          data-testid="nav-sidebar-menu"
        >
          <h4 className={`margin-0 flex flex-align-center fdr fjc space-between text-${textColor}`}>
            {!props.isLanding && (
              <div className="flex">
                <Icon className="margin-top-2px margin-right-1 usa-icon--size-3 minw-3">{accountIcon}</Icon>
                <div>{accountString}</div>
              </div>
            )}
            <button
              className="left-nav-close fac fdr fjc"
              aria-label="close menu"
              onClick={(): void => {
                analytics.event.mobile_menu_close_button.click.close_mobile_menu();
                close();
              }}
            >
              <Icon className="font-sans-xl">close</Icon>
            </button>
          </h4>
          <NavSidebarUserSettings isLanding={props.isLanding} />
          {props.showSidebar && !props.hideMiniRoadmap && (
            <div>
              <hr />
              <MiniRoadmap activeTaskId={props.task?.id} onTaskClick={close} />
            </div>
          )}
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
