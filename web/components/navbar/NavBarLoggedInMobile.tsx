import React, { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavSideBarUserSettings } from "@/components/navbar/NavSideBarUserSettings";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { FilingReference, Task } from "@/lib/types/types";
import { NavDefaults } from "@/display-content/NavDefaults";
import { MiniOperateSection } from "../roadmap/MiniOperateSection";
interface Props {
  scrolled: boolean;
  task?: Task;
  sideBarPageLayout?: boolean;
  filingsReferences?: Record<string, FilingReference>;
}

export const NavBarLoggedInMobile = ({
  scrolled,
  task,
  sideBarPageLayout,
  filingsReferences,
}: Props): ReactElement => {
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const open = () => setSidebarIsOpen(true);
  const close = () => setSidebarIsOpen(false);

  return (
    <>
      <div
        className={`left-nav-overlay ${sidebarIsOpen ? "is-visible" : ""}`}
        aria-hidden="true"
        onClick={() => {
          analytics.event.mobile_menu.click_outside.close_mobile_menu();
          close();
        }}
      />
      <nav
        aria-label="Primary"
        className={`width-100 padding-y-05 usa-navbar ${
          scrolled ? "scrolled scrolled-transition bg-white" : ""
        }`}
      >
        <button
          className="left-nav-menu-button radius-0"
          data-hamburger
          data-testid="nav-menu-open"
          aria-label="open menu"
          onClick={() => {
            analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
            open();
          }}
        >
          <Icon className="font-sans-xl">menu</Icon>
        </button>
        <div className={`usa-logo ${scrolled ? "bg-white" : ""} navigator-logo-mobile`}>
          {sideBarPageLayout ? (
            <div className="text-bold">{NavDefaults.taskPageNavBarHeading}</div>
          ) : (
            <img src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
          )}
        </div>
      </nav>
      <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
        <nav
          aria-label="Secondary"
          className={`left-nav ${sidebarIsOpen ? "is-visible" : "is-hidden"} `}
          data-testid="nav-sidebar-menu"
        >
          <button
            className="left-nav-close fdr fac fjc"
            aria-label="close menu"
            onClick={() => {
              analytics.event.mobile_menu_close_button.click.close_mobile_menu();
              close();
            }}
          >
            <Icon className="font-sans-xl">close</Icon>
          </button>
          {sideBarPageLayout && <MiniRoadmap activeTaskId={task?.id} onTaskClick={close} />}
          {sideBarPageLayout && filingsReferences && (
            <MiniOperateSection filingsReferences={filingsReferences} onClose={close} />
          )}
          <NavSideBarUserSettings />
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
