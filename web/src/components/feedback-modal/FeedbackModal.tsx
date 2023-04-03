import { FeedbackSubmittedModal } from "@/components/feedback-modal/FeedbackSubmittedModal";
import { ReportIssueModal } from "@/components/feedback-modal/ReportIssueModal";
import { RequestFeatureModal } from "@/components/feedback-modal/RequestFeatureModal";
import { SelectFeedbackModal } from "@/components/feedback-modal/SelectFeedbackModal";
import { FeedbackRequestModalNames } from "@/lib/types/types";
import { ReactElement, useEffect, useState } from "react";

type Props = {
  handleClose: () => void;
  isOpen: boolean;
  isReportAnIssueBar?: boolean;
};

export const FeedbackModal = ({ handleClose, isOpen, isReportAnIssueBar }: Props): ReactElement => {
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackRequestModalNames>("Select Feedback");

  useEffect(() => {
    if (!isOpen) {
      setCurrentFeedback("Select Feedback");
    }

    if (isReportAnIssueBar) {
      setCurrentFeedback("Report Issue");
    }
  }, [isOpen, isReportAnIssueBar]);

  if (!isOpen) {
    return <></>;
  }

  return (
    <>
      {currentFeedback === "Select Feedback" && (
        <SelectFeedbackModal isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
      {currentFeedback === "Feature Request" && (
        <RequestFeatureModal isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
      {currentFeedback === "Request Submitted" && (
        <FeedbackSubmittedModal
          isOpen={isOpen}
          onClose={handleClose}
          setCurrentFeedback={(): void => {
            setCurrentFeedback("Select Feedback");
          }}
        />
      )}
      {currentFeedback === "Report Issue" && (
        <ReportIssueModal isOpen={isOpen} onClose={handleClose} setCurrentFeedback={setCurrentFeedback} />
      )}
    </>
  );
};
