import { ButtonIcon } from "@/components/ButtonIcon";
import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import { NavBarDesktopHomeLogo } from "@/components/navbar/desktop/NavBarDesktopHomeLogo";
import { NavBarDesktopQuickLinks } from "@/components/navbar/desktop/NavBarDesktopQuickLinks";
import { NavBarVerticalLineDivider } from "@/components/navbar/desktop/NavBarDesktopVerticalLineDivider";
import { NavBarDesktopWrapper } from "@/components/navbar/desktop/NavBarDesktopWrapper";
import { NavBarLogoOnlyDesktop } from "@/components/navbar/desktop/NavBarLogoOnlyDesktop";
import {
  AddBusinessItem,
  GetStartedMenuItem,
  LogoutMenuItem,
  MyNjMenuItem,
  ProfileMenuItem,
  RegisterMenuItem,
} from "@/components/navbar/shared-submenu-components";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { NavPageTypeEnums } from "@/lib/types/types";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { UserData, getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import React, { ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  pageType?: NavPageTypeEnums;
  previousBusinessId?: string | undefined;
  isAuthenticated: boolean;
  userData?: UserData;
  CMS_PREVIEW_ONLY_SHOW_MENU?: boolean;
}

export const NavBarDesktop = (props: Props): ReactElement => {
  const business = props.userData ? getCurrentBusiness(props.userData) : undefined;
  const { Config } = useConfig();

  const [open, setOpen] = useState(props.CMS_PREVIEW_ONLY_SHOW_MENU ? true : false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = (
    event?: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
    if (props.CMS_PREVIEW_ONLY_SHOW_MENU) return;
    if (event && anchorRef.current && anchorRef.current.contains(event.target as Node)) {
      return;
    }

    setOpen(false);
  };

  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const textColor = props.isAuthenticated ? "primary" : "base";
  const navBarBusinessTitle = getNavBarBusinessTitle(business, props.isAuthenticated);
  const currentIndex =
    props.userData && business ? orderBusinessIdsByDateCreated(props.userData).indexOf(business.id) : 0;

  switch (props.pageType) {
    case "NAVIGATOR_LOGO":
    case "NAVIGATOR_MYNJ_LOGO": {
      return <NavBarLogoOnlyDesktop logoType={props.pageType} />;
    }
    case "IS_LOGIN_PAGE": {
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} isLoginPage />
        </NavBarDesktopWrapper>
      );
    }
    case "IS_SEO_STARTER_KIT": {
      // starter kits page for SEO
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={undefined} />
          <div className={"display-flex flex-row flex-align-center"}>
            <NavBarLoginButton />
          </div>
        </NavBarDesktopWrapper>
      );
    }
    case "LANDING_PAGE": {
      // landing
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={undefined} />
          <div className={"display-flex flex-row flex-align-center"}>
            <NavBarDesktopQuickLinks />
            <NavBarVerticalLineDivider />
            <NavBarLoginButton />
            <NavBarDesktopDropDown
              anchorRef={anchorRef}
              open={open}
              setOpen={setOpen}
              menuButtonTitle={Config.navigationDefaults.landingPageDropDownTitle}
              dropDownTitle={Config.navigationDefaults.landingPageDropDownTitle}
              handleClose={handleClose}
              textColor={textColor}
              icon={<Icon className="nav-bar-dropdown-account-icon" iconName="account_circle" />}
              subMenuElement={[<GetStartedMenuItem key="GetStarted" />]}
            />
          </div>
        </NavBarDesktopWrapper>
      );
    }
    case "ONBOARDING": {
      // onboarding
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
          <div className={"display-flex flex-row flex-align-center"}>
            <NavBarDesktopDropDown
              disabled={true}
              anchorRef={anchorRef}
              open={open}
              setOpen={setOpen}
              menuButtonTitle={navBarBusinessTitle}
              dropDownTitle={navBarBusinessTitle}
              handleClose={handleClose}
              textColor={textColor}
              icon={
                <div className={"margin-left-2px display-flex"}>
                  <ButtonIcon svgFilename={`business-${getBusinessIconColor(currentIndex)}`} sizePx="35px" />
                </div>
              }
              subMenuElement={[]}
            />
          </div>
        </NavBarDesktopWrapper>
      );
    }
    default: {
      if (props.isAuthenticated) {
        // authed
        return (
          <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
            <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
            <div className={"display-flex flex-row flex-align-center"}>
              <NavBarDesktopQuickLinks />
              <NavBarVerticalLineDivider />
              <NavBarDesktopDropDown
                anchorRef={anchorRef}
                open={open}
                setOpen={setOpen}
                menuButtonTitle={navBarBusinessTitle}
                dropDownTitle={getUserNameOrEmail(props.userData)}
                handleClose={handleClose}
                textColor={textColor}
                icon={
                  <div className={"margin-left-2px display-flex"}>
                    <ButtonIcon
                      svgFilename={`business-${getBusinessIconColor(currentIndex)}`}
                      sizePx="35px"
                    />
                  </div>
                }
                subMenuElement={[
                  <ProfileMenuItem
                    userData={props.userData}
                    handleClose={handleClose}
                    isAuthenticated={props.isAuthenticated}
                    key="profile"
                  />,
                  <AddBusinessItem handleClose={handleClose} key="addBusiness" />,
                  <MyNjMenuItem handleClose={handleClose} key="MyNJ" />,
                  <LogoutMenuItem handleClose={handleClose} key="Logout" />,
                ]}
              />
            </div>
          </NavBarDesktopWrapper>
        );
      } else {
        // guest
        return (
          <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
            <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
            <div className={"display-flex flex-row flex-align-center"}>
              <NavBarDesktopQuickLinks />
              <NavBarVerticalLineDivider />
              <NavBarLoginButton />
              <NavBarDesktopDropDown
                anchorRef={anchorRef}
                open={open}
                setOpen={setOpen}
                menuButtonTitle={navBarBusinessTitle}
                dropDownTitle={Config.navigationDefaults.navBarGuestAccountText}
                handleClose={handleClose}
                textColor={textColor}
                icon={
                  <div className={"margin-left-2px display-flex"}>
                    <ButtonIcon
                      svgFilename={`business-${getBusinessIconColor(currentIndex)}`}
                      sizePx="35px"
                    />
                  </div>
                }
                subMenuElement={[
                  <ProfileMenuItem
                    userData={props.userData}
                    handleClose={handleClose}
                    isAuthenticated={props.isAuthenticated}
                    key="profile"
                  />,
                  <RegisterMenuItem key="register" />,
                ]}
              />
            </div>
          </NavBarDesktopWrapper>
        );
      }
    }
  }
};
