import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/njwds-extended/Button";
import { Icon } from "@/components/njwds/Icon";
import { onSelfRegister } from "@/lib/auth/signinHelper";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { AuthAlertContext, AuthContext } from "@/pages/_app";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ReactElement, useContext, useMemo, useState } from "react";

export const NavSideBarUserSettings = (): ReactElement => {
  const { userData, update } = useUserData();
  const userName = getUserNameOrEmail(userData);
  const { state } = useContext(AuthContext);
  const { setRegistrationAlertStatus } = useContext(AuthAlertContext);

  const [accordionIsOpen, setAccordionIsOpen] = useState<boolean>(false);
  const router = useRouter();

  const isAuthenticated = useMemo(() => state.isAuthenticated == "TRUE", [state.isAuthenticated]);
  const textColor = isAuthenticated ? "primary" : "base";
  const accountIcon = isAuthenticated ? "account_circle" : "help";
  const accountString = isAuthenticated ? userName : Config.navigationDefaults.navBarGuestText;

  const UnAuthenticatedMenu = () => (
    <div className="margin-bottom-2">
      <Button
        style="tertiary"
        onClick={() => {
          analytics.event.guest_menu.click.go_to_myNJ_registration();
          onSelfRegister(router.replace, userData, update, setRegistrationAlertStatus);
        }}
      >
        <span className="text-base">{Config.navigationDefaults.navBarGuestRegistrationText}</span>
      </Button>
    </div>
  );

  const AuthenticatedMenu = () => (
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
        <Link href="/profile" passHref>
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

  return (
    <div>
      <Accordion
        elevation={0}
        expanded={accordionIsOpen}
        onChange={() => {
          !accordionIsOpen && analytics.event.account_name.click.expand_account_menu();
          setAccordionIsOpen(!accordionIsOpen);
        }}
      >
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-3 text-ink">expand_more</Icon>}
          id="user-profile-header"
        >
          <div className="margin-y-2">
            <h4 className={`flex flex-align-center text-${textColor}`}>
              <Icon className="margin-right-1 usa-icon--size-3">{accountIcon}</Icon>
              <span>{accountString}</span>
            </h4>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="margin-left-2 margin-bottom-2">
            {isAuthenticated ? AuthenticatedMenu() : UnAuthenticatedMenu()}
            <AuthButton position="NAVBAR" />
          </div>
        </AccordionDetails>
      </Accordion>
      <hr />
    </div>
  );
};
