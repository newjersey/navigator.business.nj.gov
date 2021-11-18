import { TaskDefaults } from "@/display-defaults/tasks/TaskDefaults";
import React, { ReactElement } from "react";
import analytics from "@/lib/utils/analytics";
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
    <a href={props.link} target="_blank" rel="noreferrer noopener" className="margin-left-auto">
      <div className="margin-top-4 margin-bottom-1">
        <Button
          style="primary"
          noRightMargin
          onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
        >
          {props.text || TaskDefaults.defaultCallToActionText}
        </Button>
      </div>
    </a>
  );
};
