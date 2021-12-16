import { LegalMessageDefaults } from "@/display-defaults/LegalMessageDefaults";
import React, { ReactElement } from "react";

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
