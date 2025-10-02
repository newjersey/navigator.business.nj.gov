import { ButtonIcon } from "@/components/ButtonIcon";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import { ReactElement } from "react";

interface Props {
  analyticsEvent: () => void;
}

export const LiveChatHelpButton = (props: Props): ReactElement => {
  const { Config } = useConfig();

  return (
    <div className="flex fac margin-top-3 mobile-lg:margin-top-0 mobile-lg:margin-left-auto mobile-lg:margin-right-3 width-full mobile-lg:width-auto">
      <UnStyledButton
        isBgTransparent
        className={"text-accent-cool-darker fjc padding-0"}
        isTextBold
        isIntercomEnabled
        dataTestid={"help-button"}
        onClick={props.analyticsEvent}
      >
        <ButtonIcon svgFilename="help-circle-blue" sizePx="25px" />
        {Config.formation.general.helpButtonText}
      </UnStyledButton>
    </div>
  );
};
