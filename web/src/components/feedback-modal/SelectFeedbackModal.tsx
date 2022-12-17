import { ButtonIcon } from "@/components/ButtonIcon";
import { Content } from "@/components/Content";
import { ModalZeroButton } from "@/components/ModalZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FeedbackRequestModalNames } from "@/lib/types/types";
import { LookupOperatingPhaseById } from "@businessnjgovnavigator/shared/operatingPhase";
import { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestModalNames) => void;
};

export const SelectFeedbackModal = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const { userData } = useUserData();
  const { Config } = useConfig();
  const getFeedbackLink = (): string => {
    switch (LookupOperatingPhaseById(userData?.profileData.operatingPhase).feedbackFormToDisplay) {
      case "OWNING":
        return Config.feedbackModal.feedbackModalLinkOwning;
      case "STARTING":
        return Config.feedbackModal.feedbackModalLinkStarting;
      default:
        return "";
    }
  };

  return (
    <ModalZeroButton
      isOpen={isOpen}
      close={onClose}
      title={Config.feedbackModal.feedbackModalTitle}
      maxWidth="md"
    >
      <Content className="margin-bottom-2">{Config.feedbackModal.feedbackModalBodyText}</Content>
      <div className="display-flex flex-column">
        <Button
          className="width-100"
          style="narrow-accent-cool-lightest"
          align="start"
          onClick={onClose}
          intercomButton
        >
          <ButtonIcon svgFilename="help-circle" />
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
                <ButtonIcon svgFilename="chat-processing" />
                <span className="text-left">{Config.feedbackModal.feedbackModalShareFeedbackButtonText}</span>
              </Button>
            </a>

            <Button
              className="width-100 margin-top-1"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={() => {
                return setCurrentFeedback("Report Issue");
              }}
            >
              <ButtonIcon svgFilename="bug" />
              <span className="text-left">{Config.feedbackModal.feedbackModalReportIssueButtonText}</span>
            </Button>

            <Button
              className="width-100 margin-top-1"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={() => {
                return setCurrentFeedback("Feature Request");
              }}
            >
              <ButtonIcon svgFilename="lightbulb-on" />
              <span className="text-left">{Config.feedbackModal.feedbackModalFeatureRequestButtonText}</span>
            </Button>
          </>
        )}
      </div>
    </ModalZeroButton>
  );
};
