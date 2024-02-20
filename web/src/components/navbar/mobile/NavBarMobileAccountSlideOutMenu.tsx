import { ReactElement } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { Task } from "@/lib/types/types";
import { MenuList, MenuItem } from "@mui/material";

interface Props {
  isLanding?: boolean;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  task?: Task;
  subMenuElement: ReactElement;
  closeSideBar: () => void;
  openSideBar: () => void;
  isSideBarOpen: boolean;
  title: string;
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
              <MenuList
                autoFocusItem={props.isSideBarOpen}
                variant={"selectedMenu"}
                id="menu-list-grow"
                data-testid={"nav-bar-popup-menu"}
                className="padding-bottom-0"
              >
                <MenuItem
                  className={"display-flex padding-y-205 menu-item-title"}
                  disabled={true}
                >
                  <div className="text-bold">{props.title}</div>
                </MenuItem>
                <hr className="margin-0 hr-2px" key="name-break" />

                  <button
                    className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
                    aria-label="close menu"
                    data-testid={"close-button-nav-menu"}
                    onClick={(): void => {
                      analytics.event.mobile_menu_close_button.click.close_mobile_menu();
                      props.closeSideBar();
                    }}
                    tabIndex={0}
                  >
                    <Icon className="font-sans-xl">close</Icon>
                  </button>

                {props.subMenuElement}
              </MenuList>


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
