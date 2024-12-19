import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement } from "react";
interface Props {
  useSmall?: boolean;
}

export const NavbarBusinessNjGovLogo = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const router = useRouter();
  return (
    <div className={"height-4"}>
      <UnStyledButton
        dataTestid={"business-nj-gov-logo"}
        onClick={() => {
          analytics.event.business_nj_gov_logo.click.business_nj_gov_logo();
          router.push(Config.navigationDefaults.navBarBusinessNJGovLink);
        }}
      >
        <img
          className={props.useSmall ? "height-3" : "height-4"}
          src="/img/business.NJ.gov-logo.svg"
          alt={Config.navigationDefaults.navBarBusinessNJGovAltText}
          aria-label={Config.navigationDefaults.navBarBusinessNJGovAriaLabel}
        />
      </UnStyledButton>
    </div>
  );
};
