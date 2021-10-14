import { NavDefaults } from "@/display-content/NavDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import React, { ReactElement, useState } from "react";
import { Icon } from "@/components/njwds/Icon";
import { AuthButton } from "@/components/AuthButton";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import Link from "next/link";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";

export const NavSideBarUserSettings = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmail(userData);
  const [accordionIsOpen, setAccordionIsOpen] = useState<boolean>(false);

  return (
    <div>
      <Accordion
        elevation={0}
        expanded={accordionIsOpen}
        onChange={() => setAccordionIsOpen(!accordionIsOpen)}
      >
        <AccordionSummary
          expandIcon={<Icon className="usa-icon--size-3 text-ink">expand_more</Icon>}
          id="user-profile-header"
        >
          <h4 className="flex flex-align-center margin-y-2 text-primary">
            <Icon className="margin-right-1 usa-icon--size-3">account_circle</Icon>
            <span>{userName}</span>
          </h4>
        </AccordionSummary>
        <AccordionDetails>
          <div className="margin-left-2 margin-bottom-2">
            <div className="margin-bottom-2">
              <a
                target="_blank"
                rel="noreferrer"
                className={`text-no-underline override-text-base`}
                href={process.env.MYNJ_PROFILE_LINK || ""}
              >
                {NavDefaults.myNJAccountText}
              </a>
            </div>
            <div className="margin-bottom-2">
              <Link href="/profile" passHref>
                <a href="/profile" className="text-no-underline override-text-base">
                  {NavDefaults.profileLinkText}
                </a>
              </Link>
            </div>
            <AuthButton className="clear-button text-base text-left" />
          </div>
        </AccordionDetails>
      </Accordion>
      <hr className="bg-base-lighter" />
    </div>
  );
};
