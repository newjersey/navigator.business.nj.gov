import React, { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavSideBarUserSettings } from "@/components/navbar/NavSideBarUserSettings";
import { MiniRoadmap } from "@/components/MiniRoadmap";
import { Task } from "@/lib/types/types";

interface Props {
  scrolled: boolean;
  task?: Task;
}

export const NavBarLoggedInMobile = ({ scrolled, task }: Props): ReactElement => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const open = () => setSidebarIsOpen(true);
  const close = () => setSidebarIsOpen(false);
  const isVisible = () => (sidebarIsOpen ? "is-visible" : "");

  return (
    <>
      <div
        className={`left-nav-overlay ${isVisible()}`}
        aria-hidden="true"
        onClick={() => {
          analytics.event.mobile_menu.click_outside.close_mobile_menu();
          close();
        }}
      />
      <div
        className={`width-100 padding-y-05 usa-navbar ${
          scrolled ? "scrolled scrolled-transition bg-white" : ""
        }`}
      >
        <button
          className="left-nav-menu-button radius-0"
          data-testid="nav-menu-open"
          onClick={() => {
            analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
            open();
          }}
        >
          <Icon className="font-sans-xl">menu</Icon>
        </button>
        <div className={`usa-logo ${scrolled ? "bg-white" : ""} navigator-logo-mobile`}>
          <img src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
        </div>
      </div>
      <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
        <nav aria-label="Secondary navigation" className={`left-nav ${isVisible()}`}>
          <button
            className="left-nav-close fdr fac fjc"
            onClick={() => {
              analytics.event.mobile_menu_close_button.click.close_mobile_menu();
              close();
            }}
          >
            <Icon className="font-sans-xl">close</Icon>
          </button>
          {task && <MiniRoadmap activeTaskId={task.id} />}
          <NavSideBarUserSettings />
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
