import type { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import type { ReactElement } from "react";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { getTaskStatusUpdatedMessage } from "@/lib/utils/helpers";

interface Props {
  isOpen: boolean;
  close: () => void;
  status: TaskProgress;
}

export const TaskStatusChangeSnackbar = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <SnackbarAlert
      variant="success"
      isOpen={props.isOpen}
      close={props.close}
      heading={Config.taskDefaults.taskProgressSnackbarHeading}
    >
      {getTaskStatusUpdatedMessage(props.status)}
    </SnackbarAlert>
  );
};
