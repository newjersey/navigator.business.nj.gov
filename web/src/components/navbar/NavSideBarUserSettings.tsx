import { AuthButton } from "@/components/AuthButton";
import { Icon } from "@/components/njwds/Icon";
import { NavDefaults } from "@/display-defaults/NavDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import analytics from "@/lib/utils/analytics";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import Link from "next/link";
import React, { ReactElement, useState } from "react";

export const NavSideBarUserSettings = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmail(userData);
  const [accordionIsOpen, setAccordionIsOpen] = useState<boolean>(false);

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
            <h4 className="flex flex-align-center text-primary">
              <Icon className="margin-right-1 usa-icon--size-3">account_circle</Icon>
              <span>{userName}</span>
            </h4>
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div className="margin-left-2 margin-bottom-2">
            <div className="margin-bottom-2">
              <button
                className={`clear-button override-text-base`}
                onClick={(event) => {
                  event.preventDefault();
                  analytics.event.account_menu_myNJ_account.click.go_to_myNJ_home();
                  window.open(process.env.MYNJ_PROFILE_LINK || "", "_ blank");
                }}
              >
                {NavDefaults.myNJAccountText}
              </button>
            </div>
            <div className="margin-bottom-2">
              <Link href="/profile" passHref>
                <button
                  className="clear-button override-text-base"
                  onClick={() => {
                    analytics.event.account_menu_my_profile.click.go_to_profile_screen();
                  }}
                >
                  {NavDefaults.profileLinkText}
                </button>
              </Link>
            </div>
            <AuthButton className="clear-button text-base text-left" />
          </div>
        </AccordionDetails>
      </Accordion>
      <hr />
    </div>
  );
};
