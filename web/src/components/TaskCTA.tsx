/* eslint-disable unicorn/filename-case */
import { Button } from "@/components/njwds-extended/Button";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

interface Props {
  link: string;
  text?: string;
  onClick?: () => void;
}

export const TaskCTA = (props: Props): ReactElement => {
  if (!props.link) {
    return <></>;
  }

  if (props.onClick) {
    return (
      <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4">
        <Button
          style="primary"
          noRightMargin
          onClick={() => {
            analytics.event.task_primary_call_to_action.click.open_external_website();
            if (props.onClick) {
              props.onClick();
            }
          }}
        >
          {props.text || Config.taskDefaults.defaultCallToActionText}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-justify-end bg-base-lightest margin-x-neg-4 padding-3 margin-top-3 margin-bottom-neg-4">
      <a href={props.link} target="_blank" rel="noreferrer noopener">
        <Button
          style="primary"
          noRightMargin
          onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
        >
          {props.text || Config.taskDefaults.defaultCallToActionText}
        </Button>
      </a>
    </div>
  );
};
