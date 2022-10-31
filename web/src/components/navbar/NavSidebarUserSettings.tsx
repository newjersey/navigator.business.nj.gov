import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/njwds-extended/Button";
import { AuthAlertContext } from "@/contexts/authAlertContext";
import { AuthContext } from "@/contexts/authContext";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactElement, useContext, useMemo } from "react";

export const NavSidebarUserSettings = (): ReactElement => {
  const { userData, update } = useUserData();
  const { state } = useContext(AuthContext);
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const router = useRouter();

  const isAuthenticated = useMemo(() => {
    return state.isAuthenticated == "TRUE";
  }, [state.isAuthenticated]);

  const UnAuthenticatedMenu = () => {
    return (
      <>
        <div className="margin-bottom-2">
          <Link href={ROUTES.profile} passHref>
            <Button
              style="tertiary"
              onClick={() => {
                analytics.event.account_menu_my_profile.click.go_to_profile_screen();
              }}
            >
              <span className="text-base">{Config.navigationDefaults.profileLinkText}</span>
            </Button>
          </Link>
        </div>
        <div className="margin-bottom-2">
          <Button
            style="tertiary"
            onClick={() => {
              analytics.event.guest_menu.click.go_to_myNJ_registration();
              onSelfRegister(router, userData, update, setRegistrationAlertStatus);
            }}
          >
            <span className="text-base">{Config.navigationDefaults.navBarGuestRegistrationText}</span>
          </Button>
        </div>
      </>
    );
  };

  const AuthenticatedMenu = () => {
    return (
      <>
        <div className="margin-bottom-2">
          <Button
            style="tertiary"
            onClick={(event) => {
              event.preventDefault();
              analytics.event.account_menu_myNJ_account.click.go_to_myNJ_home();
              window.open(process.env.MYNJ_PROFILE_LINK || "", "_ blank");
            }}
          >
            <span className="text-base">{Config.navigationDefaults.myNJAccountText}</span>
          </Button>
        </div>
        <div className="margin-bottom-2">
          <Link href={ROUTES.profile} passHref>
            <Button
              style="tertiary"
              onClick={() => {
                analytics.event.account_menu_my_profile.click.go_to_profile_screen();
              }}
            >
              <span className="text-base">{Config.navigationDefaults.profileLinkText}</span>
            </Button>
          </Link>
        </div>
      </>
    );
  };

  const renderMenu = () => {
    if (router.pathname === ROUTES.onboarding) {
      return <></>;
    } else if (isAuthenticated) {
      return AuthenticatedMenu();
    } else {
      return UnAuthenticatedMenu();
    }
  };

  return (
    <div>
      <hr />
      <div className="margin-left-2 margin-bottom-2">
        {renderMenu()}
        <AuthButton position="NAVBAR" />
      </div>
    </div>
  );
};
