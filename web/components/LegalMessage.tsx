import React, { ReactElement } from "react";
import { LegalMessageDefaults } from "@/display-defaults/LegalMessageDefaults";

export const LegalMessage = (): ReactElement => {
  return (
    <p>
      {LegalMessageDefaults.legalMessageTextOne}
      <button className="usa-link intercom-button clear-button">
        {LegalMessageDefaults.legalMessageLegalChat}
      </button>
      {LegalMessageDefaults.legalMessageTextTwo}
    </p>
  );
};
