import { LegalMessageDefaults } from "@/display-defaults/LegalMessageDefaults";
import analytics from "@/lib/utils/analytics";
import React, { ReactElement } from "react";

export const LegalMessage = (): ReactElement => {
  return (
    <p>
      {LegalMessageDefaults.legalMessageTextOne}
      <button
        className="usa-link intercom-button clear-button"
        onClick={analytics.event.roadmap_footer_live_chat_link.click.open_live_chat}
      >
        {LegalMessageDefaults.legalMessageLegalChat}
      </button>
      {LegalMessageDefaults.legalMessageTextTwo}
    </p>
  );
};
