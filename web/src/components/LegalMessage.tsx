import { UnStyledButton } from "@/components/njwds-extended/UnStyledButton";
import { useConfig } from "@/lib/data-hooks/useConfig";
import analytics from "@/lib/utils/analytics";
import { ReactElement } from "react";

export const LegalMessage = (): ReactElement<any> => {
  const { Config } = useConfig();

  return (
    <div className="bg-base-lightest" data-testid="legal-message">
      <div className="grid-container-widescreen desktop:padding-x-7">
        <hr className="margin-0" />
        <p className="line-height-body-2 padding-y-2 margin-top-0">
          {Config.legalMessageDefaults.legalMessageTextOne}
          <UnStyledButton
            isUnderline
            isIntercomEnabled
            onClick={analytics.event.roadmap_footer_live_chat_link.click.open_live_chat}
          >
            {Config.legalMessageDefaults.legalMessageLegalChat}
          </UnStyledButton>
          {Config.legalMessageDefaults.legalMessageTextTwo}
        </p>
      </div>
    </div>
  );
};
