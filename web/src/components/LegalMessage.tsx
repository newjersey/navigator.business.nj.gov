import { Button } from "@/components/njwds-extended/Button";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { ReactElement } from "react";

export const LegalMessage = (): ReactElement => {
  return (
    <div className="bg-base-lightest">
      <div className="grid-container-widescreen desktop:padding-x-7">
        <hr className="margin-0" />
        <p className="line-height-body-2 padding-y-2 margin-top-0">
          {Config.legalMessageDefaults.legalMessageTextOne}
          <Button
            style="tertiary"
            underline
            intercomButton
            onClick={analytics.event.roadmap_footer_live_chat_link.click.open_live_chat}
          >
            {Config.legalMessageDefaults.legalMessageLegalChat}
          </Button>
          {Config.legalMessageDefaults.legalMessageTextTwo}
        </p>
      </div>
    </div>
  );
};
