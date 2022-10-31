import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { makeButtonIcon } from "@/lib/utils/helpers";
import { ReactElement, useState } from "react";

export const ReportAnIssueBar = (): ReactElement => {
  const { Config } = useConfig();
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div
      className="bg-warning-extra-light height-5 flex flex-align-center flex-justify-center"
      data-testid="reportAnIssueBar"
    >
      <Button
        style="tertiary"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <div className="text-base-darkest flex flex-align-center flex-justify-center">
          {makeButtonIcon("bug-error-dark")}
          <span className="text-left text-bold underline">
            {Config.reportAnIssueBar.reportAnIssueBarText}
          </span>
        </div>
      </Button>

      <FeedbackModal
        isOpen={showModal}
        handleClose={() => {
          return setShowModal(false);
        }}
        isReportAnIssueBar
      />
    </div>
  );
};
