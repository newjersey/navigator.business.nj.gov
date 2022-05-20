import { FeedbackSubmittedDialog } from "@/components/betaBar/FeedbackSubmittedDialog";
import { RequestFeatureDialog } from "@/components/betaBar/RequestFeatureDialog";
import { SelectFeedbackDialog } from "@/components/betaBar/SelectFeedbackDialog";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import React, { ReactElement, useEffect, useState } from "react";

type Props = {
  handleClose: () => void;
  isOpen: boolean;
};

export const FeedbackModal = ({ handleClose, isOpen }: Props): ReactElement => {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackRequestDialogNames>("Select Feedback");

  useEffect(() => {
    if (!isOpen) {
      setCurrentFeedback("Select Feedback");
    }
  }, [isOpen]);

  if (!isOpen) return <></>;

  return (
    <>
      {currentFeedback === "Select Feedback" && (
        <SelectFeedbackDialog isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
      {currentFeedback === "Feature Request" && (
        <RequestFeatureDialog isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
      {currentFeedback === "Request Submitted" && (
        <FeedbackSubmittedDialog
          isOpen={isOpen}
          onClose={handleClose}
          setCurrentFeedback={setCurrentFeedback}
        />
      )}
    </>
  );
};
