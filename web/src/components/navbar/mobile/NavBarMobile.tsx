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
import { NavPageTypeEnums, Task } from "@/lib/types/types";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import { UserData } from "@businessnjgovnavigator/shared/userData";
import { ReactElement, useState } from "react";

interface Props {
  pageType?: NavPageTypeEnums;

  scrolled: boolean;
  task?: Task;
  hideMiniRoadmap?: boolean;
  showSidebar?: boolean;
  previousBusinessId?: string | undefined;
  isAuthenticated: boolean;
  userData?: UserData;
  CMS_PREVIEW_ONLY_SHOW_MENU?: boolean;
}

export const NavBarMobile = (props: Props): ReactElement => {
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
  switch (props.pageType) {
    case "NAVIGATOR_LOGO":
    case "NAVIGATOR_MYNJ_LOGO": {
      return (
        <NavBarLogoOnlyMobile scrolled={scrolled} showMyNjLogo={props.pageType === "NAVIGATOR_MYNJ_LOGO"} />
      );
    }
    case "IS_LOGIN_PAGE": {
      return (
        <NavBarMobileWrapper scrolled={scrolled}>
          <NavBarMobileHomeLogo
            isLoginPage
            scrolled={props.scrolled}
            showSidebar={props.showSidebar}
            previousBusinessId={props.previousBusinessId}
            businessNavBarTitle={navBarBusinessTitle}
          />
        </NavBarMobileWrapper>
      );
    }
    case "IS_SEO_STARTER_KIT": {
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
    }
    case "LANDING_PAGE": {
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
            isLanding={true}
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
    }
    case "ONBOARDING": {
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
            isLanding={false}
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
    }
    default: {
      if (props.isAuthenticated) {
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
              isLanding={false}
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
              isLanding={false}
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
    }
  }
};
