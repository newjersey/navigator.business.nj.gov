import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { getTaskStatusUpdatedMessage } from "@/lib/utils/helpers";
import { TaskProgress } from "@businessnjgovnavigator/shared/userData";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  status: TaskProgress;
}

export const TaskStatusChangeSnackbar = (props: Props): ReactElement => {
  return (
    <SnackbarAlert variant="success" isOpen={props.isOpen} close={props.close}>
      {getTaskStatusUpdatedMessage(props.status)}
    </SnackbarAlert>
  );
};
