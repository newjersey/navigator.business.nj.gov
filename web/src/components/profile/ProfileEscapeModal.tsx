import { Content } from "@/components/Content";
import { ModalThreeButton } from "@/components/ModalThreeButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  close: () => void;
  onSaveChanges: () => void;
  onLeaveWithoutSaving: () => void;
  isLoading?: boolean;
}

export const ProfileEscapeModal = (props: Props): ReactElement => {
  const { Config } = useConfig();
  return (
    <ModalThreeButton
      isOpen={props.isOpen}
      close={props.close}
      title={Config.profileDefaults.default.escapeModalHeader}
      primaryButtonText={Config.profileDefaults.default.escapeModalSaveChanges}
      primaryButtonOnClick={props.onSaveChanges}
      secondaryButtonText={Config.profileDefaults.default.escapeModalReturn}
      secondaryButtonOnClick={props.onLeaveWithoutSaving}
      tertiaryButtonText={Config.profileDefaults.default.escapeModalEscape}
      tertiaryButtonOnClick={props.close}
      isLoading={props.isLoading}
    >
      <Content>{Config.profileDefaults.default.escapeModalBody}</Content>
      <p className="text-bold margin-top-2">{Config.profileDefaults.default.escapeModalQuestion}</p>
    </ModalThreeButton>
  );
};
