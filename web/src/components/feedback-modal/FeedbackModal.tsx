import { FeedbackSubmittedDialog } from "@/components/feedback-modal/FeedbackSubmittedDialog";
import { ReportIssueDialog } from "@/components/feedback-modal/ReportIssueDialog";
import { RequestFeatureDialog } from "@/components/feedback-modal/RequestFeatureDialog";
import { SelectFeedbackDialog } from "@/components/feedback-modal/SelectFeedbackDialog";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  handleClose: () => void;
  isOpen: boolean;
  isReportAnIssueBar?: boolean;
};

export const FeedbackModal = ({ handleClose, isOpen, isReportAnIssueBar }: Props): ReactElement => {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackRequestDialogNames>("Select Feedback");

  useEffect(() => {
    if (!isOpen) {
      setCurrentFeedback("Select Feedback");
    }

    if (isReportAnIssueBar) {
      setCurrentFeedback("Report Issue");
    }
  }, [isOpen, isReportAnIssueBar]);

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
      {currentFeedback === "Report Issue" && (
        <ReportIssueDialog isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
    </>
  );
};
