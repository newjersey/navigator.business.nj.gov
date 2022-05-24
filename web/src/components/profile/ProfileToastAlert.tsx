import { ToastAlert } from "@/components/njwds-extended/ToastAlert";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { OnboardingStatus } from "@/lib/types/types";
import { OnboardingStatusLookup } from "@/lib/utils/helpers";
import React, { ReactElement } from "react";

interface Props {
  alert: OnboardingStatus;
  close: () => void;
}

export const ProfileToastAlert = (props: Props): ReactElement => {
  const { Config } = useConfig();
  const content = OnboardingStatusLookup(Config)[props.alert];
  return (
    <ToastAlert
      variant={content.variant}
      isOpen={true}
      close={props.close}
      dataTestid={`toast-alert-${props.alert}`}
      heading={content.header}
    >
      {content.body}
    </ToastAlert>
  );
};
