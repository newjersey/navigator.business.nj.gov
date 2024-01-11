import { ROUTES } from "@/lib/domain-logic/routes";
import { QuickActionLink, QuickActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";

interface LinkProps {
  type: "link";
  quickAction: QuickActionLink;
}

interface TaskProps {
  type: "task";
  quickAction: QuickActionTask;
}

export const QuickActionTile = (props: LinkProps | TaskProps): ReactElement => {
  const router = useRouter();

  const routeToAction = (): void => {
    analytics.event.quick_action_button.click.go_to_quick_action_screen(props.quickAction.filename);
    if (props.type === "task") {
      router.push(`${ROUTES.quickActions}/${props.quickAction.urlSlug}`);
    }
  };

  const tileContents: ReactNode = (
    <>
      <img
        className="usa-icon--size-4 margin-right-2"
        src={`/img/quick-actions/${props.quickAction.icon}`}
        alt=""
      />
      {props.quickAction.name}
    </>
  );

  const classNames = "quick-action-tile radius-md padding-2 fdr fac text-align-left";

  return (
    <div className="quick-action-tile-spacing desktop:grid-col-6 flex fa-stretch">
      {props.type === "link" && (
        <a
          href={props.quickAction.externalRoute}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classNames} text-base-darkest text-no-underline-override`}
          onClick={routeToAction}
        >
          {tileContents}
        </a>
      )}
      {props.type === "task" && (
        <button className={classNames} onClick={routeToAction}>
          {tileContents}
        </button>
      )}
    </div>
  );
};
