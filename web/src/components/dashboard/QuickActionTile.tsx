import { ROUTES } from "@/lib/domain-logic/routes";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement } from "react";

interface Props {
  name: string;
  url: string;
}

export const QuickActionTile = (props: Props): ReactElement => {
  const router = useRouter();

  const routeToAction = (): void => {
    analytics.event.quick_action_button.click.go_to_quick_action_screen();
    router.push(`${ROUTES.quickActions}/${props.url}`);
  };

  return (
    <button className="clear-button tablet:grid-col-6 quick-action-tile" onClick={routeToAction}>
      <div className="bg-base-extra-light border-base-lightest border-2px radius-md padding-2 fdr text-align-left fac fjc">
        <img className="usa-icon--size-4 margin-right-2" src="/img/loop.svg" alt="" />
        <div>{props.name}</div>
      </div>
    </button>
  );
};
