import React, { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "./FocusTrappedSidebar";
import { NavBarLoggedInDesktop } from "./NavBarLoggedInDesktop";
import { NavSideBarUserSettings } from "@/components/NavSideBarUserSettings";
import { MiniRoadmap } from "@/components/MiniRoadmap";
import { Task } from "@/lib/types/types";

interface Props {
  scrolled: boolean;
  isLargeScreen: boolean;
  task?: Task;
}

export const NavBarLoggedIn = ({ scrolled, isLargeScreen, task }: Props): ReactElement => {
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
      {!isLargeScreen && (
        <>
          <div
            className={`width-100 padding-y-05 usa-navbar margin-bottom-9 ${
              scrolled ? "scrolled scrolled-transition bg-white" : ""
            }`}
          >
            <button
              className="left-nav-menu-button radius-0"
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
      )}
      {isLargeScreen && <NavBarLoggedInDesktop />}
    </>
  );
};
