import { UnlockingAlert } from "@/components/tasks/UnlockingAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useTaskFromRoadmap } from "@/lib/data-hooks/useTaskFromRoadmap";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  dataTestid?: string;
  task: Task;
}

export const UnlockedBy = (props: Props): ReactElement => {
  const { business } = useUserData();
  const { Config } = useConfig();

  const taskFromRoadmap = useTaskFromRoadmap(props.task.id);

  const unlockedByTaskLinks = taskFromRoadmap
    ? taskFromRoadmap.unlockedBy.filter((it) => {
        return business?.taskProgress[it.id] !== "COMPLETED";
      })
    : [];

  return (
    <UnlockingAlert
      taskLinks={unlockedByTaskLinks}
      variant="warning"
      singularText={Config.taskDefaults.unlockedBySingular}
      pluralText={Config.taskDefaults.unlockedByPlural}
      className="margin-bottom-3"
      isLoading={!taskFromRoadmap}
      dataTestid={props.dataTestid}
    />
  );
};
