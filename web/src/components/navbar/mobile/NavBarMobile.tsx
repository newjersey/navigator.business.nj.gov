import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
import { NavBarMobileAccountSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileAccountSlideOutMenu";
import { NavBarMobileHamburgerSlideOutMenu } from "@/components/navbar/mobile/NavBarMobileHamburgerSlideOutMenu";
import { NavBarMobileHomeLogo } from "@/components/navbar/mobile/NavBarMobileHomeLogo";
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
            <>
              <GetStartedMenuItem />
              <LoginMenuItem />
            </>
          }
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={""}
        />
        <NavBarMobileHamburgerSlideOutMenu />
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
          subMenuElement={
            <>
              <LoginMenuItem />
            </>
          }
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={""}
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
          subMenuElement={
            <>
              <ProfileMenuItem handleClose={closeSideBar} />
              <AddBusinessItem handleClose={closeSideBar} />
              <MyNjMenuItem handleClose={closeSideBar} />
              <LogoutMenuItem handleClose={closeSideBar} />
            </>
          }
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={""}
        />
        <NavBarMobileHamburgerSlideOutMenu />
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
          subMenuElement={
            <>
              <ProfileMenuItem handleClose={closeSideBar} />
              <RegisterMenuItem />
              <LoginMenuItem />
            </>
          }
          closeSideBar={closeSideBar}
          openSideBar={openSidebar}
          isSideBarOpen={isSidebarOpen}
          title={""}
        />
        <NavBarMobileHamburgerSlideOutMenu  />
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
