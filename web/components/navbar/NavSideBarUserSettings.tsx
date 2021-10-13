import { NavDefaults } from "@/display-content/NavDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import React, { ReactElement } from "react";
import { Icon } from "@/components/njwds/Icon";
import { AuthButton } from "@/components/AuthButton";
import { getUserNameOrEmail } from "@/lib/utils/helpers";
import Link from "next/link";

export const NavSideBarUserSettings = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmail(userData);

  return (
    <div className="usa-accordion">
      <h2 className="usa-accordion__heading">
        <button
          data-open-user-settings
          data-testid="openSettingsBtn"
          className="usa-accordion__button nav-bar-override-usa-accordion__button"
          aria-expanded="false"
          aria-controls="a1"
        >
          {" "}
          <span className="text-primary flex flex-align-center">
            {" "}
            <Icon className="margin-right-1 usa-icon--size-4">account_circle</Icon>
            <span>{userName}</span>
          </span>
        </button>
      </h2>
      <div
        id="a1"
        className="usa-accordion__content nav-bar-override-usa-accordion__content"
        data-testid="hidden-content"
        hidden={true}
      >
        <div className="margin-left-2">
          <a
            data-my-nj-profile-link
            target="_blank"
            rel="noreferrer"
            className={`text-no-underline override-text-base`}
            href={process.env.MYNJ_PROFILE_LINK || ""}
          >
            {NavDefaults.myNJAccountText}
          </a>
          <hr className="bg-base-lighter" />
          <Link
            href="/profile"
            passHref
          >
            <a href="/profile" className="text-no-underline override-text-base">
              {NavDefaults.profileLinkText}
            </a>
          </Link>
          <hr className="bg-base-lighter" />
          <AuthButton className="clear-button text-base text-left" />
        </div>
      </div>
    </div>
  );
};
