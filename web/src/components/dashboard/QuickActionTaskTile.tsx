import { ROUTES } from "@/lib/domain-logic/routes";
import { QuickActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  quickAction: QuickActionTask;
}

export const QuickActionTaskTile = ({ quickAction }: Props): ReactElement => {
  const router = useRouter();
  const routeToAction = (): void => {
    analytics.event.quick_action_button.click.go_to_quick_action_screen(quickAction.filename);
    router.push(`${ROUTES.quickActions}/${quickAction.urlSlug}`);
  };

  return (
    <div className="quick-action-tile-spacing desktop:grid-col-6">
      <button className="clear-button width-100" onClick={routeToAction}>
        <div className="quick-action-tile radius-md fdr text-align-left fac padding-2">
          <img
            className="usa-icon--size-4 margin-right-2"
            src={`/img/quick-actions/${quickAction.icon}`}
            alt=""
          />
          {quickAction.name}
        </div>
      </button>
    </div>
  );
};
