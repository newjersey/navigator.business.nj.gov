import { ButtonIcon } from "@/components/ButtonIcon";
import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { Button } from "@/components/njwds-extended/Button";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useState } from "react";

export const BetaBar = (): ReactElement => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div
      className="display-flex flex-justify-center flex-align-center bg-warning-extra-light font-sans-xs minh-3 margin-auto width-full padding-y-1"
      data-testid="beta-bar"
    >
      <span className="margin-left-1 margin-right-1">{Config.betaBar.betaMainText}</span>
      <Button
        className="padding-y-0"
        style="secondary-blue-narrow"
        smallText
        onClick={() => {
          return setShowModal(true);
        }}
        widthAutoOnMobile
      >
        <ButtonIcon svgFilename="lightbulb-on-warning-light" sizePx="16px" />
        {Config.betaBar.betaModalButtonText}
      </Button>

      <FeedbackModal
        isOpen={showModal}
        handleClose={() => {
          return setShowModal(false);
        }}
      />
    </div>
  );
};
