import { RaffleBingoPaginator } from "@/components/tasks/RaffleBingoPaginator";
import { Task } from "@/lib/types/types";
import { rswitch } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  task: Task;
  stepIndex?: number;
}

export const RaffleBingoSwitchComponent = (props: Props): ReactElement => {
  return rswitch(props.task.filename, {
    "raffle-license-step-1": <RaffleBingoPaginator task={props.task} />,
    // "raffle-license-step-2": <RaffleBingoPreview task={props.task} />,
    default: <RaffleBingoPaginator task={props.task} />,
  });
};
