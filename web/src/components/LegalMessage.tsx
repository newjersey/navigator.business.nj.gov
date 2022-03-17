import { Button } from "@/components/njwds-extended/Button";
import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const LegalMessage = (): ReactElement => {
  return (
    <p>
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
  );
};
