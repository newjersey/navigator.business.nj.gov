import React, { ReactElement, useState } from "react";
import analytics from "@/lib/utils/analytics";
import { Icon } from "@/components/njwds/Icon";
import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavSideBarUserSettings } from "@/components/navbar/NavSideBarUserSettings";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { FilingReference, SectionType, Task } from "@/lib/types/types";
import { NavDefaults } from "@/display-content/NavDefaults";
import { SectionAccordion } from "../roadmap/SectionAccordion";
import Link from "next/link";
interface Props {
  scrolled: boolean;
  task?: Task;
  sideBar?: boolean;
  filingsReferences?: Record<string, FilingReference>;
}

export const NavBarLoggedInMobile = ({ scrolled, task, sideBar, filingsReferences }: Props): ReactElement => {
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
        aria-label="Primary Navigation"
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
          {sideBar ? (
            <div className="text-bold">{NavDefaults.taskPageNavBarHeading}</div>
          ) : (
            <img src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
          )}
        </div>
      </nav>
      <FocusTrappedSidebar close={close} isOpen={sidebarIsOpen}>
        <nav
          aria-label="Secondary navigation"
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
          {sideBar && <MiniRoadmap activeTaskId={task?.id} onTaskClick={close} />}
          {sideBar && filingsReferences && (
            <SectionAccordion sectionType={"OPERATE" as SectionType} mini={true}>
              <div className="margin-y-2"></div>
              {Object.keys(filingsReferences).map((filing) => (
                <div key={filingsReferences[filing].name}>
                  <Link href={`/filings/${filingsReferences[filing].urlSlug}`} passHref>
                    <button
                      data-testid={filingsReferences[filing].name}
                      onClick={close}
                      className="usa-link text-bold font-heading-sm text-no-underline clear-button"
                    >
                      {filingsReferences[filing].name}
                    </button>
                  </Link>
                </div>
              ))}
            </SectionAccordion>
          )}
          <NavSideBarUserSettings />
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
