import { ButtonIcon } from "@/components/ButtonIcon";
import { NavBarLoginButton } from "@/components/navbar/NavBarLoginButton";
import { NavBarVariant } from "@/components/navbar/NavBarTypes";
import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import { NavBarDesktopHomeLogo } from "@/components/navbar/desktop/NavBarDesktopHomeLogo";
import { NavBarDesktopQuickLinks } from "@/components/navbar/desktop/NavBarDesktopQuickLinks";
import { NavBarVerticalLineDivider } from "@/components/navbar/desktop/NavBarDesktopVerticalLineDivider";
import { NavBarDesktopWrapper } from "@/components/navbar/desktop/NavBarDesktopWrapper";
import { NavBarLogoOnlyDesktop } from "@/components/navbar/desktop/NavBarLogoOnlyDesktop";
import {
  createAddBusinessItems,
  createProfileMenuItems,
  GetStartedMenuItem,
  LogoutMenuItem,
  MyNjMenuItem,
  RegisterMenuItem,
} from "@/components/navbar/shared-submenu-components";
import { RemoveBusinessContext } from "@/contexts/removeBusinessContext";
import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { ROUTES } from "@/lib/domain-logic/routes";
import { UserData, getCurrentBusiness } from "@businessnjgovnavigator/shared/index";
import React, { ReactElement, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/compat/router";

interface Props {
  previousBusinessId?: string | undefined;
  variant: NavBarVariant;
  logoVariant?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  userData?: UserData;
  CMS_PREVIEW_ONLY_SHOW_MENU?: boolean;
}

export const NavBarDesktop = (props: Props): ReactElement => {
  const business = props.userData ? getCurrentBusiness(props.userData) : undefined;
  const { Config } = useConfig();

  const [open, setOpen] = useState(props.CMS_PREVIEW_ONLY_SHOW_MENU ? true : false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  // React 19: Call all hooks unconditionally at the top
  const { setShowRemoveBusinessModal } = useContext(RemoveBusinessContext);
  const { updateQueue } = useUserData();
  const router = useRouter();
  const isProfileSelected = router?.route === ROUTES.profile;

  // Simple close function for menu items (doesn't access refs)
  const closeMenu = useCallback((): void => {
    setOpen(false);
  }, []);

  const handleClose = useCallback(
    (
      event?:
        | MouseEvent
        | TouchEvent
        | React.MouseEvent<HTMLLIElement>
        | React.MouseEvent<Document>,
    ): void => {
      if (props.CMS_PREVIEW_ONLY_SHOW_MENU) return;
      if (event && anchorRef.current && anchorRef.current.contains(event.target as Node)) {
        return;
      }

      setOpen(false);
    },
    [props.CMS_PREVIEW_ONLY_SHOW_MENU],
  );

  const prevOpen = useRef(open);
  useEffect(() => {
    if (null !== anchorRef.current && prevOpen.current && !open) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const isAuthenticated = props.variant === NavBarVariant.FULL_AUTHENTICATED;
  const textColor = isAuthenticated ? "primary" : "base";
  const navBarBusinessTitle = getNavBarBusinessTitle(business, isAuthenticated);
  const currentIndex =
    props.userData && business
      ? orderBusinessIdsByDateCreated(props.userData).indexOf(business.id)
      : 0;

  switch (props.variant) {
    case NavBarVariant.LOGO_ONLY:
      return <NavBarLogoOnlyDesktop logoType={props.logoVariant!} />;

    case NavBarVariant.LOGO_WITH_TEXT:
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} isLoginPage />
        </NavBarDesktopWrapper>
      );

    case NavBarVariant.MINIMAL_WITH_LOGIN:
      return (
        <NavBarDesktopWrapper CMS_ONLY_disableSticky={props.CMS_PREVIEW_ONLY_SHOW_MENU}>
          <NavBarDesktopHomeLogo previousBusinessId={undefined} />
          <div className={"display-flex flex-row flex-align-center"}>
            <NavBarLoginButton />
          </div>
        </NavBarDesktopWrapper>
      );

    case NavBarVariant.FULL_LANDING:
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

    case NavBarVariant.MINIMAL_WITH_DISABLED_DROPDOWN:
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
                  <ButtonIcon
                    svgFilename={`business-${getBusinessIconColor(currentIndex)}`}
                    sizePx="35px"
                  />
                </div>
              }
              subMenuElement={[]}
            />
          </div>
        </NavBarDesktopWrapper>
      );

    case NavBarVariant.FULL_AUTHENTICATED:
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
                ...createProfileMenuItems(
                  props.userData,
                  closeMenu,
                  isAuthenticated,
                  Config,
                  setShowRemoveBusinessModal,
                  updateQueue,
                  router,
                  isProfileSelected,
                ),
                ...createAddBusinessItems(closeMenu, Config, router),
                <MyNjMenuItem handleClose={closeMenu} key="MyNJ" />,
                <LogoutMenuItem handleClose={closeMenu} key="Logout" />,
              ]}
            />
          </div>
        </NavBarDesktopWrapper>
      );

    case NavBarVariant.FULL_GUEST:
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
                ...createProfileMenuItems(
                  props.userData,
                  closeMenu,
                  isAuthenticated,
                  Config,
                  setShowRemoveBusinessModal,
                  updateQueue,
                  router,
                  isProfileSelected,
                ),
                <RegisterMenuItem key="register" />,
              ]}
            />
          </div>
        </NavBarDesktopWrapper>
      );
  }
};
