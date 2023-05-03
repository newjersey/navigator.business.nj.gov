import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export const TaskStatusChangeSnackbar = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <SnackbarAlert variant="success" isOpen={props.isOpen} close={props.close}>
      {Config.taskDefaults.taskProgressSuccessSnackbarBody}
    </SnackbarAlert>
  );
};
