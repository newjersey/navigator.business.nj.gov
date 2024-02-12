import { ReactElement } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import {  NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { Task } from "@/lib/types/types";

interface Props {
  isLanding?: boolean;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  task?: Task;
  subMenuElement: ReactElement;
  closeSideBar: () => void;
  openSideBar: () => void;
  isSideBarOpen: boolean;
}


export const NavBarMobileAccountSlideOutMenu = (props: Props): ReactElement => {


  return (
    <>
          <button
            className="right-nav-menu-button radius-0"
            data-testid="nav-menu-open"
            aria-label="open menu"
            onClick={(): void => {
              analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
              props.openSideBar();
            }}
          >
            <Icon className="text-accent-cool-darker font-sans-lg">account_circle</Icon>
          </button>


          <FocusTrappedSidebar close={props.closeSideBar} isOpen={props.isSideBarOpen}>
            <nav
              aria-label="Secondary"
              className={`right-nav ${props.isSideBarOpen ? "is-visible" : "is-hidden"} `}
              data-testid="nav-sidebar-menu"
            >
              <NavBarPopupMenu
                handleClose={props.closeSideBar}
                hasCloseButton={true}
                subMenuElement={props.subMenuElement}
              />

              {props.showSidebar && !props.hideMiniRoadmap && (
                <div className={"padding-x-1"}>
                  <hr />
                  <MiniRoadmap activeTaskId={props.task?.id} onTaskClick={props.closeSideBar} />
                </div>
              )}
            </nav>
          </FocusTrappedSidebar>

          <div
            className={`right-nav-overlay ${props.isSideBarOpen ? "is-visible" : ""}`}
            aria-hidden="true"
            onClick={(): void => {
              analytics.event.mobile_menu.click_outside.close_mobile_menu();
              props.closeSideBar();
            }}
          />

        </>
  )
}
