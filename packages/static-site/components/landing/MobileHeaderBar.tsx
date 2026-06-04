import Image from "next/image";
import { Icon } from "@/components/Icon";
import type { LayoutHeaderContent } from "@/domain/content/messageTypes";
import { LocalizedLink } from "./LocalizedLink";

const SITE_LOGO_PATH = "/img/business.NJ.gov-logo.svg";

export interface MobileHeaderBarProps {
  readonly content: LayoutHeaderContent;
  readonly isNavOpen: boolean;
  readonly isAccountOpen: boolean;
  readonly onNavOpen: () => void;
  readonly onAccountOpen: () => void;
}

export const MobileHeaderBar = ({
  content,
  isNavOpen,
  isAccountOpen,
  onNavOpen,
  onAccountOpen,
}: MobileHeaderBarProps) => {
  return (
    <div className="usa-mobile-header">
      <LocalizedLink
        ariaLabel={content.homeLinkAriaLabel}
        link={content.homeLink}
        title={content.homeLinkTitle}
      >
        <Image
          alt={content.logoAlt}
          height={33}
          src={SITE_LOGO_PATH}
          style={{ height: "auto" }}
          unoptimized
          width={132}
        />
      </LocalizedLink>
      <div className="usa-mobile-header__icons">
        <button
          aria-expanded={isAccountOpen}
          aria-label={content.mobileAccountButtonAriaLabel}
          className="usa-mobile-header__icon-btn"
          onClick={onAccountOpen}
          type="button"
        >
          <Icon
            className="usa-icon--size-3"
            iconName="account_circle"
            label={content.mobileAccountButtonAriaLabel}
          />
        </button>
        <button
          aria-expanded={isNavOpen}
          aria-label={content.hamburgerButtonAriaLabel}
          className="usa-mobile-header__icon-btn"
          onClick={onNavOpen}
          type="button"
        >
          <Icon
            className="usa-icon--size-3"
            iconName="menu"
            label={content.hamburgerButtonAriaLabel}
          />
        </button>
      </div>
    </div>
  );
};
