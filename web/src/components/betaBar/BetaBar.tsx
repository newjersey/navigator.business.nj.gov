import { FeedbackSubmittedDialog } from "@/components/betaBar/FeedbackSubmittedDialog";
import { RequestFeatureDialog } from "@/components/betaBar/RequestFeatureDialog";
import { SelectFeedbackDialog } from "@/components/betaBar/SelectFeedbackDialog";
import { Button } from "@/components/njwds-extended/Button";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { makeButtonIcon } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useEffect, useState } from "react";

export const BetaBar = (): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [currentFeedback, setCurrentFeedback] = useState<FeedbackRequestDialogNames>("Select Feedback");

  const openModal = (): void => {
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (!modalOpen) {
      setCurrentFeedback("Select Feedback");
    }
  }, [modalOpen]);

  return (
    <div
      className="display-flex flex-justify-center flex-align-center bg-beta font-sans-xs minh-3 margin-auto width-full padding-y-1"
      data-testid="beta-bar"
    >
      <span className="margin-left-1 margin-right-1">{Config.betaBar.betaMainText}</span>
      <Button className="padding-y-0" style="secondary-blue" smallText onClick={openModal}>
        {makeButtonIcon("lightbulb-on-warning-light", "16px")}
        {Config.betaBar.betaModalButtonText}
      </Button>

      {modalOpen && currentFeedback === "Select Feedback" && (
        <SelectFeedbackDialog
          isOpen={modalOpen}
          onClose={closeModal}
          setCurrentFeedback={setCurrentFeedback}
        />
      )}
      {modalOpen && currentFeedback === "Feature Request" && (
        <RequestFeatureDialog
          isOpen={modalOpen}
          onClose={closeModal}
          setCurrentFeedback={setCurrentFeedback}
        />
      )}
      {modalOpen && currentFeedback === "Request Submitted" && (
        <FeedbackSubmittedDialog
          isOpen={modalOpen}
          onClose={closeModal}
          setCurrentFeedback={setCurrentFeedback}
        />
      )}
    </div>
  );
};
