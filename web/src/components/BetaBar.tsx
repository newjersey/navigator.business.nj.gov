import { ButtonIcon } from "@/components/ButtonIcon";
import { FeedbackModal } from "@/components/feedback-modal/FeedbackModal";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement, useState } from "react";

export const BetaBar = (): ReactElement => {
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <div
      className="display-flex flex-justify-center flex-align-center bg-accent-warm-extra-light font-sans-xs minh-3 margin-auto width-full padding-y-1"
      data-testid="beta-bar"
    >
      <span className="margin-left-1 margin-right-1">{Config.betaBar.betaMainText}</span>
      <PrimaryButton
        isColor="secondary"
        isUnBolded={true}
        isVerticalPaddingRemoved={true}
        isSmallerText={true}
        onClick={() => {
          return setShowModal(true);
        }}
        isNotFullWidthOnMobile={true}
      >
        <ButtonIcon svgFilename="lightbulb-on-warning-light" sizePx="16px" />
        {Config.betaBar.betaModalButtonText}
      </PrimaryButton>

      <FeedbackModal
        isOpen={showModal}
        handleClose={() => {
          return setShowModal(false);
        }}
      />
    </div>
  );
};
