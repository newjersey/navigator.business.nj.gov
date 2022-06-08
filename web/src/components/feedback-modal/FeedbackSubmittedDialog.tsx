import { DialogOneButton } from "@/components/DialogOneButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const FeedbackSubmittedDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <DialogOneButton
      maxWidth="md"
      isOpen={isOpen}
      close={onClose}
      title={Config.feedbackModal.successfulSubmissionModalHeadingText}
      bodyText={Config.feedbackModal.successfulSubmissionModalBodyText}
      primaryButtonText={Config.feedbackModal.successfulSubmissionModalButtonText}
      primaryButtonOnClick={() => {
        setCurrentFeedback("Select Feedback");
      }}
    >
      <div className="width-mobile-lg margin-bottom-10" />
    </DialogOneButton>
  );
};
