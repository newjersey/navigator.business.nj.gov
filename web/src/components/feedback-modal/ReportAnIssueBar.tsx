import { ButtonIcon } from "@/components/ButtonIcon";
import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement, useState } from "react";

export const ReportAnIssueBar = (): ReactElement => {
  const { Config } = useConfig();
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div
      className="bg-accent-warm-extra-light height-5 flex flex-align-center flex-justify-center"
      data-testid="reportAnIssueBar"
    >
      <UnStyledButton
        style="tertiary"
        onClick={() => {
          setShowModal(true);
        }}
      >
        <div className="text-base-darkest flex flex-align-center flex-justify-center">
          <ButtonIcon svgFilename="bug-error-dark" />
          <span className="text-left text-bold underline">
            {Config.reportAnIssueBar.reportAnIssueBarText}
          </span>
        </div>
      </UnStyledButton>

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
