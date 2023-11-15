import { QuickActionLink } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

interface Props {
  quickAction: QuickActionLink;
}

export const QuickActionLinkTile = ({ quickAction }: Props): ReactElement => {
  const routeToAction = (): void => {
    analytics.event.quick_action_button.click.go_to_quick_action_screen(quickAction.filename);
  };

  return (
    <div className="quick-action-tile tablet:grid-col-6 ">
      <div className="bg-base-extra-light border-base-lightest border-2px radius-md fdr text-align-left fac fjc padding-2">
        <img
          className="usa-icon--size-4 margin-right-2"
          src={`/img/quick-actions/${quickAction.icon}`}
          alt=""
        />
        <a
          href={quickAction.externalRoute}
          target="_blank"
          rel="noopener noreferrer"
          className="text-base-darkest text-no-underline-override"
          onClick={routeToAction}
        >
          {quickAction.name}
        </a>
      </div>
    </div>
  );
};
