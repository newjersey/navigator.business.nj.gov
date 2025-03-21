import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { Grow, Operate, Plan, Search, Start, Updates } from "@/components/navbar/shared-submenu-components";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { ReactElement, useState } from "react";

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
        data-testid="nav-menu-mobile-quick-link-open"
        aria-label="site menu"
        onClick={(): void => {
          analytics.event.mobile_hamburger_icon_quick_links.click.open_mobile_menu();
          open();
        }}
      >
        <Icon className="text-accent-cool-more-dark font-sans-lg" iconName="menu" />
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
            <MenuItem className={"display-flex padding-y-205 menu-item-title"} disabled={true}>
              <div className="text-bold">{Config.navigationQuickLinks.navBarMobileQuickLinksTitle}</div>
            </MenuItem>
            <hr className="margin-0 hr-2px" key="name-break" />

            <button
              className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
              aria-label="close menu"
              data-testid={"nav-menu-mobile-quick-link-close"}
              onClick={(): void => {
                analytics.event.mobile_menu_close_button_quick_links.click.close_mobile_menu();
                close();
              }}
              tabIndex={0}
            >
              <Icon className="font-sans-xl" iconName="close" />
            </button>

            <Search />
            <hr className="margin-0 margin-x-3 hr-2px" key="middle-break" />
            <Plan />
            <Start />
            <Operate />
            <Grow />
            <Updates />

            <hr className="margin-0 hr-2px" key="end-break" />
          </MenuList>
        </nav>
      </FocusTrappedSidebar>

      <div
        className={`right-nav-overlay ${sidebarIsOpen ? "is-visible" : ""}`}
        data-testid="nav-menu-mobile-quick-link-close-click-outside"
        aria-hidden="true"
        onClick={(): void => {
          analytics.event.mobile_menu_quick_links.click_outside.close_mobile_menu();
          close();
        }}
      />
    </>
  );
};
