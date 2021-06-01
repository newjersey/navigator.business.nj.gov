import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import React, { ReactElement } from "react";
import { getModifiedTaskContent } from "@/lib/utils/helpers";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { Task } from "@/lib/types/types";

interface Props {
  task: Task;
}

export const TaskCTA = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const callToActionLink = getModifiedTaskContent(roadmap, props.task, "callToActionLink");
  const callToActionText = getModifiedTaskContent(roadmap, props.task, "callToActionText");

  if (!callToActionLink) {
    return <></>;
  }

  return (
    <div className="fdr">
      <a
        href={callToActionLink}
        target="_blank"
        rel="noreferrer noopener"
        className="mla margin-top-4 margin-bottom-8"
      >
        <button className="usa-button">{callToActionText || TaskDefaults.defaultCallToActionText}</button>
      </a>
    </div>
  );
};
