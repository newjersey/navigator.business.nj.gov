import { ROUTES } from "@/lib/domain-logic/routes";
import { AnytimeActionLicenseReinstatement, AnytimeActionLink, AnytimeActionTask } from "@/lib/types/types";
import analytics from "@/lib/utils/analytics";
import { useRouter } from "next/router";
import { ReactElement, ReactNode } from "react";

interface LinkProps {
  type: "link";
  anytimeAction: AnytimeActionLink;
}

interface TaskProps {
  type: "task";
  anytimeAction: AnytimeActionTask;
}

interface LicenseReinstatementProps {
  type: "license";
  anytimeAction: AnytimeActionLicenseReinstatement;
}

export const AnytimeActionTile = (props: LinkProps | LicenseReinstatementProps | TaskProps): ReactElement => {
  const router = useRouter();

  const routeToAction = (): void => {
    analytics.event.anytime_action_button.click.go_to_anytime_action_screen(props.anytimeAction.filename);
    if (props.type === "task") {
      router.push(`${ROUTES.anytimeActions}/${props.anytimeAction.urlSlug}`);
    }
    if (props.type === "license") {
      router.push(`${ROUTES.licenseReinstatement}/${props.anytimeAction.urlSlug}`);
    }
  };

  const tileContents: ReactNode = (
    <>
      <img
        className="usa-icon--size-4 margin-right-2"
        src={`/img/anytime-actions/${props.anytimeAction.icon}`}
        alt=""
      />
      {props.anytimeAction.name}
    </>
  );

  const classNames = "anytime-action-tile radius-md padding-2 fdr fac text-align-left width-100";

  return (
    <div className="anytime-action-tile-spacing desktop:grid-col-6 flex fa-stretch">
      {props.type === "link" && (
        <a
          href={props.anytimeAction.externalRoute}
          target="_blank"
          rel="noopener noreferrer"
          className={`${classNames} text-base-darkest text-no-underline-override`}
          onClick={routeToAction}
        >
          {tileContents}
        </a>
      )}
      {(props.type === "task" || props.type === "license") && (
        <button className={classNames} onClick={routeToAction}>
          {tileContents}
        </button>
      )}
    </div>
  );
};
