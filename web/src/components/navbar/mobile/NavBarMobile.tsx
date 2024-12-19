/* eslint-disable react/jsx-key */
import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { NavBarLogoOnlyMobile } from "@/components/navbar/mobile/NavBarLogoOnlyMobile";
import { NavBarMobileAccountSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileAccountSlideOutMenu";
import { NavBarMobileHomeLogo } from "@/components/navbar/mobile/NavBarMobileHomeLogo";
import { NavBarMobileQuickLinksSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileQuickLinksSlideOutMenu";
import { NavBarMobileWrapper } from "@/components/navbar/mobile/NavBarMobileWrapper";
import {
  AddBusinessItem,
  GetStartedMenuItem,
  LoginMenuItem,
  LogoutMenuItem,
  MyNjMenuItem,
  ProfileMenuItem,
  RegisterMenuItem,
} from "@/components/navbar/shared-submenu-components";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { Task } from "@/lib/types/types";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useState } from "react";

interface Props {
  scrolled: boolean;
  task?: Task;
  hideMiniRoadmap?: boolean;
  showSidebar?: boolean;
  isSeoStarterKit?: boolean;
  isLanding?: boolean;
  previousBusinessId?: string | undefined;
  logoOnlyType?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  currentlyOnboarding: boolean;
  isAuthenticated: boolean;
  userData?: UserData;
  CMS_PREVIEW_ONLY_SHOW_MENU?: boolean;
}

export const NavBarMobile = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  let currentBusiness = undefined;
  if (props.userData) {
    currentBusiness = getCurrentBusiness(props.userData);
  }

  const navBarBusinessTitle = getNavBarBusinessTitle(currentBusiness, props.isAuthenticated);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const scrolled = props.CMS_PREVIEW_ONLY_SHOW_MENU ? false : props.scrolled;

  const openSidebar = (): void => {
    if (props.CMS_PREVIEW_ONLY_SHOW_MENU) return;
    setIsSidebarOpen(true);
  };

  const closeSideBar = (): void => {
    setIsSidebarOpen(false);
  };

  // logo only / loading/redirect
  if (props.logoOnlyType) {
    return (
      <NavBarLogoOnlyMobile scrolled={scrolled} showMyNjLogo={props.logoOnlyType === "NAVIGATOR_MYNJ_LOGO"} />
    );
  } else if (props.isSeoStarterKit) {
    return (
      <NavBarMobileWrapper scrolled={scrolled}>
        <NavBarMobileHomeLogo
          scrolled={props.scrolled}
          showSidebar={props.showSidebar}
          previousBusinessId={props.previousBusinessId}
          businessNavBarTitle={navBarBusinessTitle}
        />
        <NavBarLoginButton />
      </NavBarMobileWrapper>
    );
  } else if (props.isLanding) {
    // landing
    return (
      <NavBarMobileWrapper scrolled={scrolled}>
        <NavBarMobileHomeLogo
          scrolled={props.scrolled}
          showSidebar={props.showSidebar}
          previousBusinessId={props.previousBusinessId}
          businessNavBarTitle={navBarBusinessTitle}
        />
        <NavBarMobileAccountSlideOutMenu
          isLanding={props.isLanding}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          task={props.task}
          subMenuElement={[<GetStartedMenuItem key={"getStarted"} />, <LoginMenuItem key={"login"} />]}
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={Config.navigationDefaults.landingPageDropDownTitle}
          CMS_PREVIEW_ONLY_SHOW_MENU={props.CMS_PREVIEW_ONLY_SHOW_MENU}
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  } else if (props.currentlyOnboarding) {
    // onboarding
    return (
      <NavBarMobileWrapper scrolled={scrolled}>
        <NavBarMobileHomeLogo
          scrolled={props.scrolled}
          showSidebar={props.showSidebar}
          previousBusinessId={props.previousBusinessId}
          businessNavBarTitle={navBarBusinessTitle}
        />
        <NavBarMobileAccountSlideOutMenu
          isLanding={props.isLanding}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          task={props.task}
          subMenuElement={[<LoginMenuItem key="login" />]}
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={Config.navigationDefaults.navBarGuestAccountText}
          CMS_PREVIEW_ONLY_SHOW_MENU={props.CMS_PREVIEW_ONLY_SHOW_MENU}
        />
      </NavBarMobileWrapper>
    );
  } else if (props.isAuthenticated) {
    // authed
    return (
      <NavBarMobileWrapper scrolled={scrolled}>
        <NavBarMobileHomeLogo
          scrolled={props.scrolled}
          showSidebar={props.showSidebar}
          previousBusinessId={props.previousBusinessId}
          businessNavBarTitle={navBarBusinessTitle}
        />
        <NavBarMobileAccountSlideOutMenu
          isLanding={props.isLanding}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          task={props.task}
          subMenuElement={[
            <ProfileMenuItem
              userData={props.userData}
              handleClose={closeSideBar}
              key="profile"
              isAuthenticated={props.isAuthenticated}
            />,
            <AddBusinessItem handleClose={closeSideBar} key="business" />,
            <MyNjMenuItem handleClose={closeSideBar} key="MyNJ" />,
            <LogoutMenuItem handleClose={closeSideBar} key="logout" />,
          ]}
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={getUserNameOrEmail(props.userData)}
          CMS_PREVIEW_ONLY_SHOW_MENU={props.CMS_PREVIEW_ONLY_SHOW_MENU}
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  } else {
    // guest
    return (
      <NavBarMobileWrapper scrolled={scrolled}>
        <NavBarMobileHomeLogo
          scrolled={props.scrolled}
          showSidebar={props.showSidebar}
          previousBusinessId={props.previousBusinessId}
          businessNavBarTitle={navBarBusinessTitle}
        />
        <NavBarMobileAccountSlideOutMenu
          isLanding={props.isLanding}
          showSidebar={props.showSidebar}
          hideMiniRoadmap={props.hideMiniRoadmap}
          task={props.task}
          subMenuElement={[
            <ProfileMenuItem
              handleClose={closeSideBar}
              userData={props.userData}
              isAuthenticated={props.isAuthenticated}
              key="profile"
            />,
            <RegisterMenuItem key="register" />,
            <LoginMenuItem key="login" />,
          ]}
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={Config.navigationDefaults.navBarGuestAccountText}
          CMS_PREVIEW_ONLY_SHOW_MENU={props.CMS_PREVIEW_ONLY_SHOW_MENU}
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  }
};
