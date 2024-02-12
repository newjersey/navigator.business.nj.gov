import { ReactElement, useContext, useMemo, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import {  MenuConfiguration, NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/authContext";
import { ROUTES } from "@/lib/domain-logic/routes";
import { Task } from "@/lib/types/types";

interface Props {
  isLanding?: boolean;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  task?: Task;
}


export const NavBarMobileAccountSlideOutMenu = (props: Props): ReactElement => {

  const { state } = useContext(AuthContext);



  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated === "TRUE";
  }, [state.isAuthenticated]);

  const router = useRouter();

  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const open = (): void => {
    setSidebarIsOpen(true);
  };

  const close = (): void => {
    setSidebarIsOpen(false);
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

  const currentlyOnboarding = (): boolean => {
    if (!router) {
      return false;
    }
    return router.pathname === ROUTES.onboarding;
  };

  return (
    <>
          <button
            className="right-nav-menu-button radius-0"
            data-testid="nav-menu-open"
            aria-label="open menu"
            onClick={(): void => {
              analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
              open();
            }}
          >
            <Icon className="text-accent-cool-darker font-sans-lg">account_circle</Icon>
          </button>


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

          <div
            className={`right-nav-overlay ${sidebarIsOpen ? "is-visible" : ""}`}
            aria-hidden="true"
            onClick={(): void => {
              analytics.event.mobile_menu.click_outside.close_mobile_menu();
              close();
            }}
          />

        </>
  )
}
