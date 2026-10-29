import type { OnboardingStatus } from "@businessnjgovnavigator/shared/types";
import type { ReactElement } from "react";
import { SnackbarAlert } from "@/components/njwds-extended/SnackbarAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { OnboardingStatusLookup } from "@/lib/utils/helpers";

interface Props {
  alert: OnboardingStatus;
  close: () => void;
}

export const ProfileSnackbarAlert = (props: Props): ReactElement => {
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
