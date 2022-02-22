import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";
import analytics from "@/lib/utils/analytics";
import React, { ReactElement } from "react";
import { Button } from "./njwds-extended/Button";

interface Props {
  link: string;
  text?: string;
}

export const TaskCTA = (props: Props): ReactElement => {
  if (!props.link) {
    return <></>;
  }

  return (
    <div className="flex flex-justify-end margin-top-3 padding-3 margin-x-neg-3 margin-bottom-neg-3 bg-base-lightest">
      <div>
        <a href={props.link} target="_blank" rel="noreferrer noopener">
          <Button
            style="primary"
            noRightMargin
            onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
          >
            {props.text || TaskDefaults.defaultCallToActionText}
          </Button>
        </a>
      </div>
    </div>
  );
};
