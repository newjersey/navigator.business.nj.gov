import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export const TaskStatusTaxRegistrationSnackbar = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <SnackbarAlert variant="success" isOpen={props.isOpen} close={props.close}>
      <h2>{Config.dashboardDefaults.taxRegistrationSnackbarHeading}</h2>
      <p>{Config.dashboardDefaults.taxRegistrationSnackbarBody}</p>
    </SnackbarAlert>
  );
};
