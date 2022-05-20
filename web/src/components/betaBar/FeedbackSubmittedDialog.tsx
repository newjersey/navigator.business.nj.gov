import { DialogOneButton } from "@/components/DialogOneButton";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const FeedbackSubmittedDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  return (
    <DialogOneButton
      maxWidth="md"
      isOpen={isOpen}
      close={onClose}
      title={Config.betaBar.successfulSubmissionModalHeadingText}
      bodyText={Config.betaBar.successfulSubmissionModalBodyText}
      primaryButtonText={Config.betaBar.successfulSubmissionModalButtonText}
      primaryButtonOnClick={() => {
        setCurrentFeedback("Select Feedback");
      }}
    >
      <div className="width-mobile-lg margin-bottom-10" />
    </DialogOneButton>
  );
};
