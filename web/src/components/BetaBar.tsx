import { ButtonIcon } from "@/components/ButtonIcon";
import { PrimaryButton } from "@/components/njwds-extended/PrimaryButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

export const BetaBar = (): ReactElement<any> => {
  const { Config } = useConfig();

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
        isIntercomEnabled
        isNotFullWidthOnMobile={true}
        onClick={analytics.event.share_feedback.click.open_live_chat}
      >
        <ButtonIcon svgFilename="lightbulb-on-warning-light" sizePx="16px" />
        {Config.betaBar.betaModalButtonText}
      </PrimaryButton>
    </div>
  );
};
