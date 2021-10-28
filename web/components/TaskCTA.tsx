import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import React, { ReactElement } from "react";
import analytics from "@/lib/utils/analytics";

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
      <button
        className="usa-button margin-top-4 margin-bottom-1 margin-right-0"
        onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
      >
        {props.text || TaskDefaults.defaultCallToActionText}
      </button>
    </a>
  );
};
