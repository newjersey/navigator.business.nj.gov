import { ReactElement } from "react";
import { LegalMessageDefaults } from "@/display-content/LegalMessageDefaults";

interface Props {
    className?: string;
}

export const LegalMessage = (): ReactElement => {
    return (
    <div className="grey-bg align-justify">
        <div className="display-flex fjc fac padding-2 line-height-body-2 legal-footer-roadmap legal-footer-roadmap-mobile">
          <p>
            {LegalMessageDefaults.legalMessageTextOne}
            <button className="usa-link intercom-button clear-button">
              {LegalMessageDefaults.legalMessageLegalChat}
            </button>
            {LegalMessageDefaults.legalMessageTextTwo}
          </p>{" "}
        </div>
      </div>
    )


}