import { NavDefaults } from "@/display-content/NavDefaults";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { ReactElement } from "react";
import { Icon } from "@/components/njwds/Icon";
import { AuthButton } from "@/components/AuthButton";
import Link from "next/link";
import { getUserNameOrEmailIfUserNameIsUndefinedFromUserData } from "@/lib/utils/helpers";

export const NavSideBarUserSettings = (): ReactElement => {
  const { userData } = useUserData();
  const userName = getUserNameOrEmailIfUserNameIsUndefinedFromUserData(userData);

  return (
    <>
      <div aria-label="Primary navigation">
        <ul className="usa-nav__primary usa-accordion">
          <li className="usa-nav__primary-item">
            <span className="text-primary text-bold font-heading-sm flex fac margin-y-05">
              <Icon className="margin-right-1 usa-icon--size-4">account_circle</Icon>
              <span className="text-no-wrap">{userName}</span>
            </span>
            <ul id="basic-nav-section-one" className="usa-nav__submenu padding-left-4">
              <li className="usa-nav__submenu-item">
                <Link href={process.env.MYNJ_PROFILE_LINK || ""}>
                  <button id="left-nav-button-padding-left-0" className="cursor-pointer">
                    {NavDefaults.myNJAccountText}
                  </button>
                </Link>
              </li>
              <li className="usa-nav__submenu-item">
                <AuthButton className={"cursor-pointer"} />
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </>
  );
};
