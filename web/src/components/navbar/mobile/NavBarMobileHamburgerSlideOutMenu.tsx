import { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
// import {  NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavBarPopupMenu } from "@/components/navbar/NavBarPopupMenu";




export const NavBarMobileHamburgerSlideOutMenu = (): ReactElement => {



  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);

  const open = (): void => {
    setSidebarIsOpen(true);
  };

  const close = (): void => {
    setSidebarIsOpen(false);
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
            <Icon className="text-accent-cool-darker font-sans-lg">menu</Icon>
          </button>


          <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
            <nav
              aria-label="Secondary"
              className={`right-nav ${sidebarIsOpen ? "is-visible" : "is-hidden"} `}
              data-testid="nav-sidebar-menu"
            >
              {/* <NavBarPopupMenu
                handleClose={close}
                hasCloseButton={true}
                menuConfiguration={"NJ-general-links"}
              /> */}
              <button>not done yet</button>


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
