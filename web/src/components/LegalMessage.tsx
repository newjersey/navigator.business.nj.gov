import analytics from "@/lib/utils/analytics";
import Defaults from "@businessnjgovnavigator/content/display-defaults/defaults.json";
import React, { ReactElement } from "react";

export const LegalMessage = (): ReactElement => {
  return (
    <p>
      {Defaults.legalMessageDefaults.legalMessageTextOne}
      <button
        className="usa-link intercom-button clear-button"
        onClick={analytics.event.roadmap_footer_live_chat_link.click.open_live_chat}
      >
        {Defaults.legalMessageDefaults.legalMessageLegalChat}
      </button>
      {Defaults.legalMessageDefaults.legalMessageTextTwo}
    </p>
  );
};
