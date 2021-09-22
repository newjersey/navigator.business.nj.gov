import React, { ReactElement, useMemo } from "react";
import { Alert } from "@/components/njwds/Alert";
import { TaskDefaults } from "@/display-content/tasks/TaskDefaults";
import { TaskLink } from "@/lib/types/types";
import { useRoadmap } from "@/lib/data-hooks/useRoadmap";
import { getUrlSlugs } from "@/lib/utils/helpers";

interface Props {
  taskLinks: TaskLink[];
}

export const UnlockedBy = (props: Props): ReactElement => {
  const { roadmap } = useRoadmap();
  const taskLinksInRoadmap = useMemo((): TaskLink[] => {
    const allTaskUrlSlugs = getUrlSlugs(roadmap);
    return props.taskLinks.filter((it) => allTaskUrlSlugs.includes(it.urlSlug));
  }, [props.taskLinks, roadmap]);

  if (taskLinksInRoadmap.length === 0) return <></>;

  return (
    <div className="margin-bottom-3">
      <Alert variant="warning" slim>
        {taskLinksInRoadmap.length === 1 ? TaskDefaults.unlockedBySingular : TaskDefaults.unlockedByPlural}{" "}
        {taskLinksInRoadmap.map((taskLink, index) => (
          <span key={taskLink.urlSlug}>
            <a href={taskLink.urlSlug}>{taskLink.name}</a>
            {index != taskLinksInRoadmap.length - 1 ? ", " : ""}
          </span>
        ))}
      </Alert>
    </div>
  );
};
