import { ButtonIcon } from "@/components/ButtonIcon";
import { NavMenuItem } from "@/components/navbar/NavMenuItem";
import { Icon } from "@/components/njwds/Icon";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSelfRegister, onSignOut } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { QUERIES, ROUTES, routeWithQuery } from "@/lib/domain-logic/routes";
import { switchCurrentBusiness } from "@/lib/domain-logic/switchCurrentBusiness";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { MenuItem, MenuList } from "@mui/material";
import { useRouter } from "next/router";
import { ReactElement, useContext } from "react";

export type MenuConfiguration =
  | "profile"
  | "profile-register-login"
  | "profile-mynj-addbusiness-logout"
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
  const { state, dispatch } = useContext(AuthContext);
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const router = useRouter();

  const guestOrUserName =
    props.menuConfiguration === "login"
      ? Config.navigationDefaults.navBarGuestText
      : getUserNameOrEmail(userData);
  const isProfileSelected = router.route === ROUTES.profile;

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

  const addBusinessItem = (): ReactElement[] => {
    return [
      NavMenuItem({
        onClick: (): void => {
          routeWithQuery(router, {
            path: ROUTES.onboarding,
            queries: { [QUERIES.additionalBusiness]: "true" },
          });
          props.handleClose();
        },
        icon: <ButtonIcon svgFilename="add-business-plus" sizePx="25px" />,
        hoverIcon: <ButtonIcon svgFilename="add-business-plus-hover" sizePx="25px" />,
        itemText: Config.navigationDefaults.addBusinessButton,
        key: "addBusinessMenuItem",
        dataTestid: "addBusinessMenuItem",
      }),
      <hr className="margin-0 hr-2px" key={"add-break-1"} />,
    ];
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
      key: "getStartedMenuItem",
    });
  };

  const profileMenuItem = (): ReactElement[] => {
    if (!userData) return [];
    return orderBusinessIdsByDateCreated(userData).flatMap((businessId, i) => {
      const isCurrent = businessId === userData.currentBusinessId;

      const businessMenuItems = [
        NavMenuItem({
          onClick: async (): Promise<void> => {
            if (Object.keys(userData.businesses).length > 1) {
              await updateQueue?.queue(switchCurrentBusiness(userData, businessId)).update();
            }
            props.handleClose();
            await router.push(ROUTES.dashboard);
          },
          selected: !isProfileSelected && isCurrent,
          icon: <ButtonIcon svgFilename={`business-${getBusinessIconColor(i)}`} sizePx="35px" />,
          itemText: getNavBarBusinessTitle(userData.businesses[businessId], state.isAuthenticated),
          dataTestid: `business-title-${i}`,
          key: `business-title-${businessId}`,
          className: `profile-menu-item ${isCurrent ? "current" : ""}`,
        }),
      ];

      if (isCurrent) {
        const profileLink = NavMenuItem({
          onClick: (): void => {
            analytics.event.account_menu_my_profile.click.go_to_profile_screen();
            router.push(ROUTES.profile);
          },
          selected: isProfileSelected && isCurrent,
          itemText: Config.navigationDefaults.profileLinkText,
          key: `profile-title-${businessId}`,
          dataTestid: `profile-link`,
          className: `profile-menu-item ${isCurrent ? "current" : ""}`,
        });
        businessMenuItems.push(profileLink);
      }

      businessMenuItems.push(<hr className="margin-0 hr-2px" key={`profile-break-${i}`} />);

      return businessMenuItems;
    });
  };

  const renderMenu = (): ReactElement[] | undefined | Array<ReactElement | ReactElement[]> => {
    if (props.menuConfiguration === "login") {
      return [loginMenuItem()];
    }
    if (props.menuConfiguration === "profile") {
      return [profileMenuItem()];
    }
    if (props.menuConfiguration === "profile-mynj-addbusiness-logout") {
      return [profileMenuItem(), addBusinessItem(), myNjMenuItem(), logoutMenuItem()];
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
      <hr className="margin-0 hr-2px" key="name-break" />
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
