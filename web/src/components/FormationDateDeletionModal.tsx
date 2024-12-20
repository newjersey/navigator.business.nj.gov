import { Content } from "@/components/Content";
import { ModalTwoButton } from "@/components/ModalTwoButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  isOpen: boolean;
  handleCancel: () => void;
  handleDelete: () => void;
}

export const FormationDateDeletionModal = (props: Props): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <ModalTwoButton
      isOpen={props.isOpen}
      close={props.handleCancel}
      title={Config.formationDateDeletionModal.header}
      primaryButtonText={Config.formationDateDeletionModal.deleteButtonText}
      primaryButtonOnClick={props.handleDelete}
      secondaryButtonText={Config.formationDateDeletionModal.cancelButtonText}
    >
      <div className="margin-bottom-3">
        <Content>{Config.formationDateDeletionModal.description}</Content>
      </div>
      <p>{Config.formationDateDeletionModal.areYouSureModalBody}</p>
    </ModalTwoButton>
  );
};
