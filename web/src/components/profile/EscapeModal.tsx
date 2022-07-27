import { ModalTwoButton } from "@/components/ModalTwoButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  primaryButtonOnClick: () => void;
}

export const EscapeModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <ModalTwoButton
      isOpen={props.isOpen}
      close={props.close}
      title={Config.profileDefaults.escapeModalHeader}
      bodyText={Config.profileDefaults.escapeModalBody}
      primaryButtonText={Config.profileDefaults.escapeModalReturn}
      primaryButtonOnClick={props.primaryButtonOnClick}
      secondaryButtonText={Config.profileDefaults.escapeModalEscape}
    />
  );
};
