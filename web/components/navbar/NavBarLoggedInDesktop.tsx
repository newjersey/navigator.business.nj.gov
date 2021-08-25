import React, { ReactElement } from "react";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Icon } from "@/components/njwds/Icon";
import { AuthButton } from "@/components/AuthButton";
import { getUserNameOrEmail } from "@/lib/utils/helpers";

export const NavBarLoggedInDesktop = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmail(userData);

  return (
    <div className="grid-container">
      <div className="grid-row grid-gap">
        <div className="desktop:grid-col-12 usa-prose">
          <header className="flex fac fjb">
            <div className="flex-custom">
              <img className="padding-top-1" src="/img/Navigator-logo.svg" alt="Business.NJ.Gov Navigator" />
            </div>
            <div className="margin-left-auto flex fac">
              <span className="text-no-wrap padding-right-1">
                <span>
                  <div className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button flex fac">
                    <Icon className="margin-right-1 usa-icon--size-4">account_circle</Icon>
                    {userName}
                  </div>
                </span>
              </span>
              <span className="text-no-wrap nav-padding-x">
                <AuthButton className="usa-link text-primary text-bold font-heading-sm text-decoration-none cursor-pointer clear-button" />
              </span>
            </div>
          </header>
        </div>
      </div>
    </div>
  );
};
