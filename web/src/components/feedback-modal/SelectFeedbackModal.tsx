import { ButtonIcon } from "@/components/ButtonIcon";
import { Content } from "@/components/Content";
import { ModalZeroButton } from "@/components/ModalZeroButton";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
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
        <PrimaryButton
          isColor="accent-cool-lightest"
          isFullWidthOnDesktop={true}
          isTextAlignedLeft={true}
          onClick={onClose}
          intercomButton
          isUnBolded={true}
        >
          <ButtonIcon svgFilename="help-circle" />
          <span className="text-left">{Config.feedbackModal.feedbackModalIntercomButtonText}</span>
        </PrimaryButton>

        {userData?.formProgress === "COMPLETED" && (
          <>
            <a
              className="margin-top-1"
              data-testid="feedback-link"
              href={getFeedbackLink()}
              target="_blank"
              rel="noreferrer"
            >
              <PrimaryButton
                isColor="accent-cool-lightest"
                isFullWidthOnDesktop={true}
                isTextAlignedLeft={true}
                isUnBolded={true}
              >
                <ButtonIcon svgFilename="chat-processing" />
                <span className="text-left">{Config.feedbackModal.feedbackModalShareFeedbackButtonText}</span>
              </PrimaryButton>
            </a>
            <div className="margin-top-1">
              <PrimaryButton
                isColor="accent-cool-lightest"
                isFullWidthOnDesktop={true}
                isTextAlignedLeft={true}
                isUnBolded={true}
                onClick={(): void => setCurrentFeedback("Report Issue")}
              >
                <ButtonIcon svgFilename="bug" />
                <span className="text-left">{Config.feedbackModal.feedbackModalReportIssueButtonText}</span>
              </PrimaryButton>
            </div>

            <div className="margin-top-1">
              <PrimaryButton
                isColor="accent-cool-lightest"
                isFullWidthOnDesktop={true}
                isTextAlignedLeft={true}
                isUnBolded={true}
                onClick={(): void => setCurrentFeedback("Feature Request")}
              >
                <ButtonIcon svgFilename="lightbulb-on" />
                <span className="text-left">
                  {Config.feedbackModal.feedbackModalFeatureRequestButtonText}
                </span>
              </PrimaryButton>
            </div>
          </>
        )}
      </div>
    </ModalZeroButton>
  );
};
