import { AuthButton } from "@/components/AuthButton";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const NavBarLandingDesktop = (): ReactElement => {
  const router = useRouter();

  return (
    <div className="position-sticky top-0 z-500 bg-white">
      <nav
        aria-label="Primary"
        className={
          "grid-container-widescreen desktop:padding-x-7 height-8 flex flex-justify flex-align-center flex-wrap"
        }
      >
        <img
          className="height-4 margin-y-2"
          src="/img/Navigator-logo@2x.png"
          alt="Business.NJ.Gov Navigator"
        />
        <div>
          <UnStyledButton
            style="default"
            onClick={(): void => {
              analytics.event.landing_page_navbar_register.click.go_to_onboarding();
              router.push(ROUTES.onboarding);
            }}
          >
            {Config.navigationDefaults.registerButton}
          </UnStyledButton>
          <span className="margin-left-2">
            <AuthButton landing />
          </span>
        </div>
      </nav>
      <hr className="margin-0" />
    </div>
  );
};
