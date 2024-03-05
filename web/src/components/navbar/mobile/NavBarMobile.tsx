/* eslint-disable react/jsx-key */
import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
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
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { Task } from "@/lib/types/types";
import { ReactElement, useState } from "react";

interface Props {
  scrolled: boolean;
  task?: Task;
  hideMiniRoadmap?: boolean;
  showSidebar?: boolean;
  isLanding?: boolean;
  previousBusinessId?: string | undefined;
  logoOnlyType?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  currentlyOnboarding: boolean;
  isAuthenticated: boolean;
}

export const NavBarMobile = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();

  const navBarBusinessTitle = getNavBarBusinessTitle(business, props.isAuthenticated);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = (): void => {
    setIsSidebarOpen(true);
  };

  const closeSideBar = (): void => {
    setIsSidebarOpen(false);
  };

  // logo only / loading/redirect
  if (props.logoOnlyType) {
    return <NavBarLogoOnly logoType={props.logoOnlyType} />;
  } else if (props.isLanding) {
    // landing
    return (
      <NavBarMobileWrapper scrolled={props.scrolled}>
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
          subMenuElement={
            [<GetStartedMenuItem key={"getStarted"} />, <LoginMenuItem key={"login"} />] // needed so tests will pass (is stupid)
          }
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={Config.navigationDefaults.landingPageDropDownTitle}
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  } else if (props.currentlyOnboarding) {
    // onboarding
    return (
      <NavBarMobileWrapper scrolled={props.scrolled}>
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
          title={Config.navigationDefaults.navBarGuestBusinessText}
        />
      </NavBarMobileWrapper>
    );
  } else if (props.isAuthenticated) {
    // authed
    return (
      <NavBarMobileWrapper scrolled={props.scrolled}>
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
          title={navBarBusinessTitle}
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  } else {
    // guest
    return (
      <NavBarMobileWrapper scrolled={props.scrolled}>
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
        />
        <NavBarMobileQuickLinksSlideOutMenu />
      </NavBarMobileWrapper>
    );
  }

  // landing
  // [get started, login]
  // Has Hamburger
  // onboarding
  // [login]
  // No Hamburger
  // guest other
  // [guest profile stuff, link with myNJ, login]
  // Has Hamburger
  // authed other
  // [business profile stuff, add business, myNJ account, log out, roadmap]
  // Has Hamburger
};
