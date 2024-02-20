import { ButtonIcon } from "@/components/ButtonIcon";
import { NavMenuItem } from "@/components/navbar/NavMenuItem";
import { AuthContext } from "@/contexts/authContext";
import { NeedsAccountContext } from "@/contexts/needsAccountContext";
import { triggerSignIn } from "@/lib/auth/sessionHelper";
import { onSignOut, onSelfRegister } from "@/lib/auth/signinHelper";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { getBusinessIconColor } from "@/lib/domain-logic/getBusinessIconColor";
import { getNavBarBusinessTitle } from "@/lib/domain-logic/getNavBarBusinessTitle";
import { orderBusinessIdsByDateCreated } from "@/lib/domain-logic/orderBusinessIdsByDateCreated";
import { routeWithQuery, ROUTES, QUERIES } from "@/lib/domain-logic/routes";
import { switchCurrentBusiness } from "@/lib/domain-logic/switchCurrentBusiness";
import analytics from "@/lib/utils/analytics";
import { openInNewTab } from "@/lib/utils/helpers";
import router, { useRouter } from "next/router";
import { ReactElement, useContext } from "react";




export const LoginMenuItem = (): ReactElement => {
  const { Config } = useConfig();
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

export const LogoutMenuItem = (props: { handleClose: () => void}): ReactElement => {

  const { Config } = useConfig();
  const { dispatch } = useContext(AuthContext);
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

export const MyNjMenuItem = (props: { handleClose: () => void}): ReactElement => {

  const { Config } = useConfig();
  return NavMenuItem({
    onClick: (): void => {
      analytics.event.account_menu_myNJ_account.click.go_to_myNJ_home();
      openInNewTab(process.env.MYNJ_PROFILE_LINK || "");
      props.handleClose();
    },
    icon: <ButtonIcon svgFilename="profile" sizePx="25px" />,
    itemText: Config.navigationDefaults.myNJAccountText,
    key: "myNjMenuItem",
  });
};

export const AddBusinessItem = (props: { handleClose: () => void}): ReactElement[] => {
  const { Config } = useConfig();
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

export const RegisterMenuItem = (): ReactElement => {
  const { Config } = useConfig();
  const { userData, updateQueue } = useUserData();

  const { setRegistrationStatus } = useContext(NeedsAccountContext);

  return NavMenuItem({
    onClick: (): void => {
      analytics.event.guest_menu.click.go_to_NavigatorAccount_setup();
      onSelfRegister({ router, updateQueue, userData, setRegistrationStatus });
    },
    icon: <ButtonIcon svgFilename="profile" sizePx="25px" />,
    itemText: Config.navigationDefaults.navBarGuestRegistrationText,
    key: "registerMenuItem",
  });
};

export const GetStartedMenuItem = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: (): void => {
      router.push(ROUTES.onboarding);
    },
    itemText: Config.navigationDefaults.registerButton,
    key: "getStartedMenuItem",
  });
};

export const ProfileMenuItem = (props: { handleClose: () => void}): ReactElement[] => {

  const { Config } = useConfig();

  const { state } = useContext(AuthContext);
  const isAuthenticated = state.isAuthenticated === "TRUE";
  const { userData, updateQueue } = useUserData();
  const router = useRouter();
  const isProfileSelected = router.route === ROUTES.profile;

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
        itemText: getNavBarBusinessTitle(userData.businesses[businessId], isAuthenticated),
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



export const Search = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarSearchLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarSearchText,
    key: "searchMenuItem",
    reducedLeftMargin: true,
  });
};

export const Plan = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarPlanLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarPlanText,
    key: "planMenuItem",
    reducedLeftMargin: true,
  });
};

export const Start = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarStartLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarStartText,
    key: "startMenuItem",
    reducedLeftMargin: true,
  });
};

export const Operate = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarOperateLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarOperateText,
    key: "operateMenuItem",
    reducedLeftMargin: true,
  });
};

export const Grow = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarGrowLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarGrowText,
    key: "growMenuItem",
    reducedLeftMargin: true,
  });
};

export const Updates = (): ReactElement => {
  const { Config } = useConfig();
  return NavMenuItem({
    onClick: () => window.open(Config.navigationDefaults.navigationQuickLinks.navBarUpdatesLink, '_blank'),
    itemText: Config.navigationDefaults.navigationQuickLinks.navBarUpdatesText,
    key: "updatesMenuItem",
    reducedLeftMargin: true,
  });
};
