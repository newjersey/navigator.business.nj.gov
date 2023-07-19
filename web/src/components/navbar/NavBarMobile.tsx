import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { MenuConfiguration, NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { NavigatorLogo } from "@/components/navbar/NavigatorLogo";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { AuthContext } from "@/contexts/authContext";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement, useContext, useMemo, useState } from "react";

interface Props {
  scrolled: boolean;
  task?: Task;
  hideMiniRoadmap?: boolean;
  showSidebar?: boolean;
  isLanding?: boolean;
}

export const NavBarMobile = (props: Props): ReactElement => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const { state } = useContext(AuthContext);
  const { business } = useUserData();
  const router = useRouter();

  const open = (): void => {
    setSidebarIsOpen(true);
  };

  const close = (): void => {
    setSidebarIsOpen(false);
  };

  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);

  const currentlyOnboarding = (): boolean => {
    if (!router) {
      return false;
    }
    return router.pathname === ROUTES.onboarding;
  };

  const getMenuConfiguration = (): MenuConfiguration => {
    if (props.isLanding) {
      return "login-getstarted";
    }
    if (currentlyOnboarding()) {
      return "login";
    } else if (isAuthenticated) {
      return "profile-mynj-addbusiness-logout";
    } else {
      return "profile-register-login";
    }
  };

  return (
    <>
      <div
        className={`right-nav-overlay ${sidebarIsOpen ? "is-visible" : ""}`}
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
        <div className={`usa-logo ${props.scrolled ? "bg-white" : ""}`}>
          {props.showSidebar ? (
            <div className="text-bold font-body-sm truncate-long-business-names_NavBarMobile">
              {getNavBarBusinessTitle(business)}
            </div>
          ) : (
            <NavigatorLogo />
          )}
        </div>
        <button
          className="right-nav-menu-button radius-0"
          data-testid="nav-menu-open"
          aria-label="open menu"
          onClick={(): void => {
            analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
            open();
          }}
        >
          <Icon className="font-sans-xl">menu</Icon>
        </button>
      </nav>
      <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
        <nav
          aria-label="Secondary"
          className={`right-nav ${sidebarIsOpen ? "is-visible" : "is-hidden"} `}
          data-testid="nav-sidebar-menu"
        >
          <NavBarPopupMenu
            handleClose={close}
            hasCloseButton={true}
            menuConfiguration={getMenuConfiguration()}
          />

          {props.showSidebar && !props.hideMiniRoadmap && (
            <div className={"padding-x-1"}>
              <hr />
              <MiniRoadmap activeTaskId={props.task?.id} onTaskClick={close} />
            </div>
          )}
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
