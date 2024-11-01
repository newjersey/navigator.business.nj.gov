import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { Icon } from "@/components/njwds/Icon";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { MenuItem, MenuList } from "@mui/material";
import { ReactElement } from "react";

interface Props {
  isLanding?: boolean;
  showSidebar?: boolean;
  hideMiniRoadmap?: boolean;
  task?: Task;
  subMenuElement: ReactElement[];
  closeSideBar: () => void;
  openSideBar: () => void;
  isSideBarOpen: boolean;
  title: string;
  CMS_PREVIEW_ONLY_SHOW_MENU?: boolean;
}

export const NavBarMobileAccountSlideOutMenu = (props: Props): ReactElement => {
  return (
    <>
      <button
        className="right-nav-menu-button radius-0"
        data-testid="nav-menu-mobile-account-open"
        aria-label="My Account Menu"
        onClick={(): void => {
          analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
          props.openSideBar();
        }}
      >
        <Icon className="text-accent-cool-darker font-sans-lg" iconName="account_circle" />
      </button>

      <FocusTrappedSidebar
        close={props.closeSideBar}
        isOpen={props.isSideBarOpen}
        CMS_ONLY_disable_focus_trap={props.CMS_PREVIEW_ONLY_SHOW_MENU}
      >
        <nav
          aria-label="Secondary"
          className={`right-nav ${props.isSideBarOpen ? "is-visible" : "is-hidden"} ${
            props.CMS_PREVIEW_ONLY_SHOW_MENU ? "cms-only-mobile-menu-preview" : ""
          }`}
          data-testid="nav-sidebar-menu"
        >
          <MenuList
            autoFocusItem={props.isSideBarOpen}
            variant={"selectedMenu"}
            id="menu-list-grow"
            data-testid={"nav-bar-popup-menu"}
            className="padding-bottom-0"
          >
            <MenuItem className={"display-flex padding-y-205 menu-item-title"} disabled={true}>
              <div className="text-bold">{props.title}</div>
            </MenuItem>
            <hr className="margin-0 hr-2px" key="name-break" />

            <button
              className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
              aria-label="close menu"
              data-testid={"nav-menu-mobile-account-close"}
              onClick={(): void => {
                analytics.event.mobile_menu_close_button.click.close_mobile_menu();
                props.closeSideBar();
              }}
              tabIndex={0}
            >
              <Icon className="font-sans-xl" iconName="close" />
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
        data-testid="nav-menu-mobile-account-close-click-outside"
        onClick={(): void => {
          analytics.event.mobile_menu.click_outside.close_mobile_menu();
          props.closeSideBar();
        }}
      />
    </>
  );
};
