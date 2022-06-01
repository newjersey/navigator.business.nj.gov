import { FocusTrappedSidebar } from "@/components/FocusTrappedSidebar";
import { NavSidebarUserSettings } from "@/components/navbar/NavSidebarUserSettings";
import { Icon } from "@/components/njwds/Icon";
import { MiniOperateSection } from "@/components/roadmap/MiniOperateSection";
import { MiniRoadmap } from "@/components/roadmap/MiniRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { routeForPersona } from "@/lib/domain-logic/routeForPersona";
import { OperateReference, Task } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import Link from "next/link";
import { ReactElement, useMemo, useState } from "react";
interface Props {
  scrolled: boolean;
  task?: Task;
  sidebarPageLayout?: boolean;
  operateReferences?: Record<string, OperateReference>;
}

export const NavBarMobile = ({
  scrolled,
  task,
  sidebarPageLayout,
  operateReferences,
}: Props): ReactElement => {
  const { userData } = useUserData();
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const open = () => setSidebarIsOpen(true);
  const close = () => setSidebarIsOpen(false);

  const redirectUrl = useMemo(
    () => routeForPersona(userData?.profileData.businessPersona),
    [userData?.profileData.businessPersona]
  );

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
          data-testid="nav-menu-open"
          aria-label="open menu"
          onClick={() => {
            analytics.event.mobile_hamburger_icon.click.open_mobile_menu();
            open();
          }}
        >
          <Icon className="font-sans-xl">menu</Icon>
        </button>
        <div className={`usa-logo ${scrolled ? "bg-white" : ""}`}>
          {sidebarPageLayout ? (
            <div className="text-bold">{Config.navigationDefaults.taskPageNavBarHeading}</div>
          ) : (
            <Link href={redirectUrl} passHref>
              <a href={redirectUrl}>
                <img className="height-3" src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
              </a>
            </Link>
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
          {sidebarPageLayout &&
            (operateReferences != null && Object.keys(operateReferences).length > 0 ? (
              <MiniOperateSection operateReferences={operateReferences} onClose={close} />
            ) : (
              <MiniRoadmap activeTaskId={task?.id} onTaskClick={close} />
            ))}
          <NavSidebarUserSettings />
        </nav>
      </FocusTrappedSidebar>
    </>
  );
};
