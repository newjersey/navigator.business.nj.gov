import { Content } from "@/components/Content";
import { ModalOneButton } from "@/components/ModalOneButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: () => void;
};

export const FeedbackSubmittedModal = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <ModalOneButton
      maxWidth="md"
      isOpen={isOpen}
      close={onClose}
      title={Config.feedbackModal.successfulSubmissionModalHeadingText}
      primaryButtonText={Config.feedbackModal.successfulSubmissionModalButtonText}
      primaryButtonOnClick={setCurrentFeedback}
    >
      <div className="width-mobile-lg">
        <Content>{Config.feedbackModal.successfulSubmissionModalBodyText}</Content>
      </div>
    </ModalOneButton>
  );
};
