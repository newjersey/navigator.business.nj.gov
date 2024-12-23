import { Icon } from "@/components/njwds/Icon";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import Link from "next/link";
import { ReactElement } from "react";

interface Props {
  backButtonText: string;
}

export const BackButtonForLayout = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <nav aria-label={Config.taskDefaults.secondaryNavigationAriaLabel}>
      <Link
        href={ROUTES.dashboard}
        data-testid="back-to-dashboard"
        className="usa-link fdr fac margin-top-3 margin-bottom-3 usa-link-hover-override desktop:margin-top-0 desktop:margin-bottom-4 width-max-content"
        onClick={analytics.event.task_back_to_roadmap.click.view_roadmap}
      >
        {/*<a href={ROUTES.dashboard}>*/}
        <div className="circle-3 bg-accent-cool-darkest icon-blue-bg-color-hover">
          <Icon className="text-white usa-icon--size-3" iconName="arrow_back" />
        </div>
        <div className="margin-left-2 margin-y-auto text-accent-cool-darkest font-sans-xs usa-link text-blue-color-hover">
          {props.backButtonText}
        </div>
        {/*</a>*/}
      </Link>
    </nav>
  );
};
