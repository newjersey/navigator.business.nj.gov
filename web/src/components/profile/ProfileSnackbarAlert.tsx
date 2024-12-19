import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { OnboardingStatus } from "@/lib/types/types";
import { OnboardingStatusLookup } from "@/lib/utils/helpers";
import { ReactElement } from "react";

interface Props {
  alert: OnboardingStatus;
  close: () => void;
}

export const ProfileSnackbarAlert = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  const content = OnboardingStatusLookup(Config)[props.alert];
  return (
    <SnackbarAlert
      variant={content.variant}
      isOpen={true}
      close={props.close}
      dataTestid={`snackbar-alert-${props.alert}`}
      heading={content.header}
    >
      {content.body}
    </SnackbarAlert>
  );
};
