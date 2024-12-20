import { Heading } from "@/components/njwds-extended/Heading";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
}

export const TaskStatusTaxRegistrationSnackbar = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <SnackbarAlert variant="success" isOpen={props.isOpen} close={props.close}>
      <Heading level={2}>{Config.dashboardDefaults.taxRegistrationSnackbarHeading}</Heading>
      <p>{Config.dashboardDefaults.taxRegistrationSnackbarBody}</p>
    </SnackbarAlert>
  );
};
