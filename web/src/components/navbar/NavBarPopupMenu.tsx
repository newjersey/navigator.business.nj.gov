import { ButtonIcon } from "@/components/ButtonIcon";
import { NavMenuItem } from "@/components/navbar/NavMenuItem";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister, onSignOut } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { MenuItem, MenuList } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export type MenuConfiguration =
  | "profile"
  | "profile-register-login"
  | "profile-myNj-logout"
  | "login"
  | "login-getstarted";

export interface Props {
  handleClose: () => void;
  open?: boolean;
  hasCloseButton?: boolean;
  menuConfiguration: MenuConfiguration;
}

export const NavBarPopupMenu = (props: Props): ReactElement => {
  const { userData, updateQueue } = useUserData();
  const { dispatch } = useContext(AuthContext);
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const router = useRouter();

  const guestOrUserName =
    props.menuConfiguration === "login"
      ? Config.navigationDefaults.navBarGuestText
      : getUserNameOrEmail(userData);
  const isProfileSelected = router.route === ROUTES.profile;

  const navBarBusinessTitle = getNavBarBusinessTitle(userData);

  function handleListKeyDown(event: React.KeyboardEvent): void {
    if (event.key === "Tab") {
      event.preventDefault();
      props.handleClose();
    }
  }

  const loginMenuItem = (): ReactElement => {
    return NavMenuItem({
      onClick: (): void => {
        analytics.event.landing_page_navbar_log_in.click.go_to_myNJ_login();
        triggerSignIn();
      },
      icon: <ButtonIcon svgFilename="login" sizePx="25px" />,
      itemText: Config.navigationDefaults.logInButton,
      key: "loginMenuItem",
    });
  };

  const logoutMenuItem = (): ReactElement => {
    return NavMenuItem({
      onClick: (): void => {
        onSignOut(router.push, dispatch);
        props.handleClose();
      },
      icon: <ButtonIcon svgFilename="logout" sizePx="25px" />,
      itemText: Config.navigationDefaults.logoutButton,
      key: "logoutMenuItem",
    });
  };

  const myNjMenuItem = (): ReactElement => {
    return NavMenuItem({
      onClick: (): void => {
        analytics.event.account_menu_myNJ_account.click.go_to_myNJ_home();
        window.open(process.env.MYNJ_PROFILE_LINK || "", "_ blank");
        props.handleClose();
      },
      icon: <ButtonIcon svgFilename="profile" sizePx="25px" />,
      itemText: Config.navigationDefaults.myNJAccountText,
      key: "myNjMenuItem",
    });
  };

  const registerMenuItem = (): ReactElement => {
    return NavMenuItem({
      onClick: (): void => {
        analytics.event.guest_menu.click.go_to_myNJ_registration();
        onSelfRegister(router, updateQueue, userData, setRegistrationAlertStatus);
      },
      icon: <ButtonIcon svgFilename="profile" sizePx="25px" />,
      itemText: Config.navigationDefaults.navBarGuestRegistrationText,
      key: "registerMenuItem",
    });
  };

  const getStartedMenuItem = (): ReactElement => {
    return NavMenuItem({
      onClick: (): void => {
        router.push(ROUTES.onboarding);
      },
      itemText: Config.navigationDefaults.registerButton,
      key: "getStartedMnueItem",
    });
  };

  const profileMenuItem = (): ReactElement[] => {
    return [
      <hr className="margin-0 hr-2px" key={"profile-break-1"} />,

      NavMenuItem({
        onClick: (): void => {
          router.push(ROUTES.dashboard);
        },
        selected: !isProfileSelected,
        icon: <ButtonIcon svgFilename="business-green" sizePx="35px" />,
        itemText: navBarBusinessTitle,
        key: "dashboardMenuItem",
        className: "profile-menu-item",
      }),

      NavMenuItem({
        onClick: (): void => {
          analytics.event.account_menu_my_profile.click.go_to_profile_screen();
          router.push(ROUTES.profile);
        },
        selected: isProfileSelected,
        itemText: Config.navigationDefaults.profileLinkText,
        key: "profileMenuItem",
        dataTestid: "profile-link",
        className: "profile-menu-item",
      }),

      <hr className="margin-0 hr-2px" key={"profile-break-2"} />,
    ];
  };

  const renderMenu = (): ReactElement[] | undefined | Array<ReactElement | ReactElement[]> => {
    if (props.menuConfiguration === "login") {
      return [loginMenuItem()];
    }
    if (props.menuConfiguration === "profile") {
      return [profileMenuItem()];
    }
    if (props.menuConfiguration === "profile-myNj-logout") {
      return [profileMenuItem(), myNjMenuItem(), logoutMenuItem()];
    }
    if (props.menuConfiguration === "profile-register-login") {
      return [profileMenuItem(), registerMenuItem(), loginMenuItem()];
    }
    if (props.menuConfiguration === "login-getstarted") {
      return [getStartedMenuItem(), loginMenuItem()];
    }
  };

  return (
    <MenuList
      autoFocusItem={props.open}
      variant={"selectedMenu"}
      id="menu-list-grow"
      onKeyDown={handleListKeyDown}
      data-testid={"nav-bar-popup-menu"}
      className="padding-bottom-0"
    >
      <MenuItem
        className={`display-flex ${props.hasCloseButton ? "padding-y-205" : "padding-y-1"} menu-item-title`}
        disabled={true}
      >
        <div className="text-bold">{guestOrUserName}</div>
      </MenuItem>
      {props.hasCloseButton && (
        <button
          className="right-nav-close fac fdr fjc position-absolute usa-position-bottom-right top-0 right-0 margin-y-2 margin-x-105"
          aria-label="close menu"
          data-testid={"close-button-nav-menu"}
          onClick={(): void => {
            analytics.event.mobile_menu_close_button.click.close_mobile_menu();
            props.handleClose();
          }}
          tabIndex={0}
        >
          <Icon className="font-sans-xl">close</Icon>
        </button>
      )}

      {renderMenu()}
    </MenuList>
  );
};
