import { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import { Grow, Operate, Plan, Search, Start, Updates } from "@/components/navbar/shared-submenu-components";
import { useConfig } from "@/lib/data-hooks/useConfig";




export const NavBarMobileQuickLinksSlideOutMenu = (): ReactElement => {



  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const open = (): void => {
    setSidebarIsOpen(true);
  };

  const close = (): void => {
    setSidebarIsOpen(false);
  };

  const { Config } = useConfig();

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
            <Icon className="text-accent-cool-darker font-sans-lg">menu</Icon>
          </button>


          <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
            <nav
              aria-label="Secondary"
              className={`right-nav ${sidebarIsOpen ? "is-visible" : "is-hidden"} `}
              data-testid="nav-sidebar-menu"
            >
              <MenuList
                autoFocusItem={sidebarIsOpen}
                variant={"selectedMenu"}
                id="menu-list-grow"
                data-testid={"nav-bar-popup-menu"}
                className="padding-bottom-0"
              >
                <MenuItem
                  className={"display-flex padding-y-205 menu-item-title"}
                  disabled={true}
                >
                  <div className="text-bold">{Config.navigationDefaults.navigationQuickLinks.navBarMobileQuickLinksTitle}</div>
                </MenuItem>
                <hr className="margin-0 hr-2px" key="name-break" />

                  <button
                    className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
                    aria-label="close menu"
                    data-testid={"close-button-nav-menu"}
                    onClick={(): void => {
                      analytics.event.mobile_menu_close_button.click.close_mobile_menu();
                      close();
                    }}
                    tabIndex={0}
                  >
                    <Icon className="font-sans-xl">close</Icon>
                  </button>

                  <Search/>
                  <hr className="margin-0 margin-x-2 hr-1px" key="end-break" />
                  <Plan/>
                  <Start/>
                  <Operate/>
                  <Grow/>
                  <Updates/>


                  <hr className="margin-0 hr-2px" key="end-break" />
              </MenuList>





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
