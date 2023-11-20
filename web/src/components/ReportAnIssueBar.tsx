import { ButtonIcon } from "@/components/ButtonIcon";
import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

export const ReportAnIssueBar = (): ReactElement => {
  const { Config } = useConfig();

  return (
    <div
      className="bg-accent-warm-extra-light height-5 flex flex-align-center flex-justify-center"
      data-testid="reportAnIssueBar"
    >
      <UnStyledButton
        style="standard"
        isIntercomEnabled
        onClick={analytics.event.report_something_that_is_broken.click.open_live_chat}
      >
        <div className="text-base-darkest flex flex-align-center flex-justify-center">
          <ButtonIcon svgFilename="bug-error-dark" />
          <span className="text-left text-bold underline">
            {Config.reportAnIssueBar.reportAnIssueBarText}
          </span>
        </div>
      </UnStyledButton>
    </div>
  );
};
