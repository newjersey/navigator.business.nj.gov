import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  primaryButtonOnClick: () => void;
}

export const ProfileEscapeModal = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();
  return (
    <ModalTwoButton
      isOpen={props.isOpen}
      close={props.close}
      title={Config.profileDefaults.default.escapeModalHeader}
      primaryButtonText={Config.profileDefaults.default.escapeModalReturn}
      primaryButtonOnClick={props.primaryButtonOnClick}
      secondaryButtonText={Config.profileDefaults.default.escapeModalEscape}
    >
      <Content>{Config.profileDefaults.default.escapeModalBody}</Content>
    </ModalTwoButton>
  );
};
