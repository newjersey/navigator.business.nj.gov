import { AuthButton } from "@/components/AuthButton";
import { ButtonIcon } from "@/components/ButtonIcon";
import { NavBarDesktopDropDown } from "@/components/navbar/desktop/NavBarDesktopDropDown";
import { NavBarDesktopHomeLogo } from "@/components/navbar/desktop/NavBarDesktopHomeLogo";
import { NavBarDesktopQuickLinks } from "@/components/navbar/desktop/NavBarDesktopQuickLinks";
import { NavBarVerticalLineDivider } from "@/components/navbar/desktop/NavBarDesktopVerticalLineDivider";
import { NavBarDesktopWrapper } from "@/components/navbar/desktop/NavBarDesktopWrapper";
import { NavBarLogoOnly } from "@/components/navbar/NavBarLogoOnly";
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
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import React, { ReactElement, useEffect, useRef, useState } from "react";

interface Props {
  previousBusinessId?: string | undefined;
  isLanding: boolean | undefined;
  logoOnlyType?: "NAVIGATOR_LOGO" | "NAVIGATOR_MYNJ_LOGO" | undefined;
  currentlyOnboarding: boolean | undefined;
  isAuthenticated: boolean;
}

export const NavBarDesktop = (props: Props): ReactElement => {
  const { business, userData } = useUserData();
  const { Config } = useConfig();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement | null>(null);

  const handleClose = (
    event?: MouseEvent | TouchEvent | React.MouseEvent<HTMLLIElement> | React.MouseEvent<Document>
  ): void => {
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
    userData && business ? orderBusinessIdsByDateCreated(userData).indexOf(business.id) : 0;

  if (props.logoOnlyType) {
    // loading/redirect
    return <NavBarLogoOnly logoType={props.logoOnlyType} />;
  } else if (props.isLanding) {
    // landing
    return (
      <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={undefined} />
        <div className={"display-flex flex-row flex-align-center"}>
          <NavBarDesktopQuickLinks/>
          <NavBarVerticalLineDivider/>
          <span className="margin-right-2">
            <AuthButton landing />
          </span>
          <NavBarDesktopDropDown
            currentIndex={currentIndex}
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            menuButtonTitle={Config.navigationDefaults.landingPageDropDownTitle}
            dropDownTitle={Config.navigationDefaults.landingPageDropDownTitle}
            isAuthenticated={props.isAuthenticated}
            handleClose={handleClose}
            textColor={textColor}
            icon={<Icon className="nav-bar-dropdown-account-icon">account_circle</Icon>}
            subMenuElement={
            <>
              <GetStartedMenuItem/>
            </>
            }
          />
        </div>
      </NavBarDesktopWrapper>
    );
  } else if (props.currentlyOnboarding) {
    // onboarding
    return (
      <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
        <div className={"display-flex flex-row flex-align-center"}>
          <span className="margin-right-2">
            <AuthButton landing />
          </span>
          <NavBarDesktopDropDown
            disabled={true}
            currentIndex={currentIndex}
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            menuButtonTitle={navBarBusinessTitle}
            dropDownTitle={navBarBusinessTitle}
            isAuthenticated={props.isAuthenticated}
            handleClose={handleClose}
            textColor={textColor}
            icon={<div className={"margin-left-2px display-flex"}><ButtonIcon svgFilename={`business-${getBusinessIconColor(currentIndex)}`} sizePx="35px" /></div>}
            subMenuElement={<></>}
          />
        </div>
      </NavBarDesktopWrapper>
    );
  } else if (props.isAuthenticated) {
    // authed
    return (
      <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
        <div className={"display-flex flex-row flex-align-center"}>
          <NavBarDesktopQuickLinks/>
          <NavBarVerticalLineDivider/>
          <NavBarDesktopDropDown
            currentIndex={currentIndex}
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            menuButtonTitle={navBarBusinessTitle}
            dropDownTitle={navBarBusinessTitle}
            isAuthenticated={props.isAuthenticated}
            handleClose={handleClose}
            textColor={textColor}
            icon={<div className={"margin-left-2px display-flex"}><ButtonIcon svgFilename={`business-${getBusinessIconColor(currentIndex)}`} sizePx="35px" /></div>}
            subMenuElement={
              <>
                <ProfileMenuItem handleClose={handleClose} />
                <AddBusinessItem handleClose={handleClose} />
                <MyNjMenuItem handleClose={handleClose} />
                <LogoutMenuItem handleClose={handleClose} />
              </>
            }
          />
        </div>
      </NavBarDesktopWrapper>
    );
  } else {
    // guest
    return (
      <NavBarDesktopWrapper>
        <NavBarDesktopHomeLogo previousBusinessId={props.previousBusinessId} />
        <div className={"display-flex flex-row flex-align-center"}>
          <NavBarDesktopQuickLinks/>
          <NavBarVerticalLineDivider/>
          <span className="margin-right-2">
            <AuthButton landing />
          </span>
          <NavBarDesktopDropDown
            currentIndex={currentIndex}
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            menuButtonTitle={navBarBusinessTitle}
            dropDownTitle={Config.navigationDefaults.navBarGuestAccountText}
            isAuthenticated={props.isAuthenticated}
            handleClose={handleClose}
            textColor={textColor}
            icon={<div className={"margin-left-2px display-flex"}><ButtonIcon svgFilename={`business-${getBusinessIconColor(currentIndex)}`} sizePx="35px" /></div>}
            subMenuElement={
              <>
                <ProfileMenuItem handleClose={handleClose} />
                <RegisterMenuItem/>
              </>
            }
          />
        </div>
      </NavBarDesktopWrapper>
    );
  }
};
