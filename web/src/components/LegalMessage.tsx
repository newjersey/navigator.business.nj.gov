import analytics from "@/lib/utils/analytics";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import React, { ReactElement } from "react";

export const LegalMessage = (): ReactElement => {
  return (
    <p>
      {Config.legalMessageDefaults.legalMessageTextOne}
      <button
        className="usa-link intercom-button clear-button"
        onClick={analytics.event.roadmap_footer_live_chat_link.click.open_live_chat}
      >
        {Config.legalMessageDefaults.legalMessageLegalChat}
      </button>
      {Config.legalMessageDefaults.legalMessageTextTwo}
    </p>
  );
};
