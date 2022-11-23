import { AuthButton } from "@/components/AuthButton";
import { Button } from "@/components/njwds-extended/Button";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { useRouter } from "next/router";
import { ReactElement } from "react";

export const NavBarLanding = (): ReactElement => {
  const router = useRouter();

  return (
    <nav
      aria-label="Primary"
      className={
        "grid-container-widescreen desktop:padding-x-7 height-8 flex flex-justify flex-align-center flex-wrap"
      }
    >
      <img className="height-4 margin-y-2" src="/img/Navigator-logo@2x.png" alt="Business.NJ.Gov Navigator" />
      <div>
        <span className="margin-right-2">
          <AuthButton landing />
        </span>
        <Button
          style="tertiary"
          onClick={() => {
            analytics.event.landing_page_navbar_register.click.go_to_onboarding();
            router.push(ROUTES.onboarding);
          }}
        >
          {Config.navigationDefaults.registerButton}
        </Button>
      </div>
    </nav>
  );
};
