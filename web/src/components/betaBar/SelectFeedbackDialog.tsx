import { DialogZeroButton } from "@/components/DialogZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import { useUserData } from "@/lib/data-hooks/useUserData";
import { FeedbackRequestDialogNames } from "@/lib/types/types";
import { makeButtonIcon } from "@/lib/utils/helpers";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

type Props = {
  onClose: () => void;
  isOpen: boolean;
  setCurrentFeedback: (str: FeedbackRequestDialogNames) => void;
};

export const SelectFeedbackDialog = ({ onClose, isOpen, setCurrentFeedback }: Props): ReactElement => {
  const { userData } = useUserData();

  const getFeedbackLink = (): string => {
    switch (userData?.profileData.businessPersona) {
      case "OWNING":
        return Config.betaBar.betaFormLinkOwning;
      case "STARTING":
        return Config.betaBar.betaFormLinkStarting;
      default:
        return "";
    }
  };

  return (
    <DialogZeroButton
      isOpen={isOpen}
      close={onClose}
      title={Config.betaBar.betaModalTitle}
      bodyText={Config.betaBar.betaModalBodyText}
      maxWidth="md"
    >
      <div className="display-flex flex-column padding-bottom-2">
        <div className="intercom-button">
          <Button className="width-100" style="narrow-accent-cool-lightest" align="start" onClick={onClose}>
            {makeButtonIcon("help-circle")}
            {Config.betaBar.betaModalIntercomButtonText}
          </Button>
        </div>
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
                {Config.betaBar.betaModalFeedbackButtonText}
              </Button>
            </a>

            <Button
              className="width-100 margin-top-1"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={() => setCurrentFeedback("Feature Request")}
            >
              {makeButtonIcon("lightbulb-on")}
              {Config.betaBar.betaModalFeatureRequestButtonText}
            </Button>
          </>
        )}
      </div>
    </DialogZeroButton>
  );
};
