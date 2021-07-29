import React, { ReactElement } from "react";
import { LegalMessageDefaults } from "@/display-content/LegalMessageDefaults";

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
