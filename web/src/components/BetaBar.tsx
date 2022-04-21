import { DialogZeroButton } from "@/components/DialogZeroButton";
import { Button } from "@/components/njwds-extended/Button";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement, useState } from "react";

export const BetaBar = (): ReactElement => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const openModal = (): void => {
    setModalOpen(true);
  };

  const closeModal = (): void => {
    setModalOpen(false);
  };

  const makeButtonIcon = (svgFilename: string, size = "20px"): ReactElement => (
    <img
      className="margin-right-05 margin-left-neg-1"
      width={size}
      height={size}
      src={`/img/${svgFilename}.svg`}
      alt=""
    />
  );

  return (
    <div className="display-flex flex-justify-center flex-align-center bg-beta font-sans-xs minh-3 margin-auto width-full padding-y-1">
      <span className="margin-left-1 margin-right-1">{Config.betaBar.betaMainText}</span>
      <Button className="padding-y-0" style="secondary-blue" smallText onClick={openModal}>
        {makeButtonIcon("lightbulb-on-warning-light", "16px")}
        {Config.betaBar.betaModalButtonText}
      </Button>

      <DialogZeroButton
        isOpen={modalOpen}
        close={closeModal}
        title={Config.betaBar.betaModalTitle}
        bodyText={Config.betaBar.betaModalBodyText}
        maxWidth="md"
      >
        <div className="display-flex flex-column padding-bottom-2">
          <div className="intercom-button">
            <Button
              className="width-100"
              style="narrow-accent-cool-lightest"
              align="start"
              onClick={closeModal}
            >
              {makeButtonIcon("help-circle")}
              {Config.betaBar.betaModalIntercomButtonText}
            </Button>
          </div>
          <a className="margin-top-1" href={Config.betaBar.betaFormLink}>
            <Button className="width-100" style="narrow-accent-cool-lightest" align="start">
              {makeButtonIcon("chat-processing")}
              {Config.betaBar.betaModalFeedbackButtonText}
            </Button>
          </a>
        </div>
      </DialogZeroButton>
    </div>
  );
};
