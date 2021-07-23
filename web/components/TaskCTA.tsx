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
    <div className="fdr">
      <a
        href={props.link}
        target="_blank"
        rel="noreferrer noopener"
        className="mla margin-top-4 margin-bottom-8"
      >
        <button
          className="usa-button"
          onClick={analytics.event.task_primary_call_to_action.click.open_external_website}
        >
          {props.text || TaskDefaults.defaultCallToActionText}
        </button>
      </a>
    </div>
  );
};
