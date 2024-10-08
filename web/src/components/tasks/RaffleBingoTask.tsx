import { TaskHeader } from "@/components/TaskHeader";
import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { Task } from "@/lib/types/types";
import { ReactElement } from "react";

interface Props {
  task: Task;
}

export const RaffleBingoTask = (props: Props): ReactElement => {
  return (
    <div>
      <TaskHeader task={props.task} />
      <RaffleBingoPaginator task={props.task} />
    </div>
  );
};
