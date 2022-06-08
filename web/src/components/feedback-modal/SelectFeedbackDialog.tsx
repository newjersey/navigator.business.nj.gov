import { DialogZeroButton } from "@/components/DialogZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { makeButtonIcon } from "@/lib/utils/helpers";
import { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const SelectFeedbackDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const { userData } = useUserData();
  const { Config } = useConfig();

  const getFeedbackLink = (): string => {
    switch (userData?.profileData.businessPersona) {
      case "OWNING":
        return Config.feedbackModal.feedbackModalLinkOwning;
      case "STARTING":
        return Config.feedbackModal.feedbackModalLinkStarting;
      default:
        return "";
    }
  };

  return (
    <DialogZeroButton
      isOpen={isOpen}
      close={onClose}
      title={Config.feedbackModal.feedbackModalTitle}
      bodyText={Config.feedbackModal.feedbackModalBodyText}
      maxWidth="md"
    >
      <div className="display-flex flex-column">
        <Button
          className="width-100"
          style="narrow-accent-cool-lightest"
          align="start"
          onClick={onClose}
          intercomButton
        >
          {makeButtonIcon("help-circle")}
          <span className="text-left">{Config.feedbackModal.feedbackModalIntercomButtonText}</span>
        </Button>

        {userData?.formProgress === "COMPLETED" && (
          <>
            <a
              className="margin-top-1"
              data-testid="feedback-link"
              href={getFeedbackLink()}
              target="_blank"
              rel="noreferrer"
            >
              <Button className="width-100" style="narrow-accent-cool-lightest" align="start">
                {makeButtonIcon("chat-processing")}
                <span className="text-left">{Config.feedbackModal.feedbackModalShareFeedbackButtonText}</span>
              </Button>
            </a>

            <Button
              className="width-100 margin-top-1"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={() => setCurrentFeedback("Report Issue")}
            >
              {makeButtonIcon("bug")}
              <span className="text-left">{Config.feedbackModal.feedbackModalReportIssueButtonText}</span>
            </Button>

            <Button
              className="width-100 margin-top-1"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={() => setCurrentFeedback("Feature Request")}
            >
              {makeButtonIcon("lightbulb-on")}
              <span className="text-left">{Config.feedbackModal.feedbackModalFeatureRequestButtonText}</span>
            </Button>
          </>
        )}
      </div>
    </DialogZeroButton>
  );
};
