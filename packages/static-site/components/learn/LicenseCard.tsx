import Markdown from "react-markdown";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License } from "@/domain/content/types";
import { HighlightedText } from "./highlightMatches";

interface Props {
  readonly license: License;
  readonly messages: LicensingGuidePageMessages;
  readonly query?: string;
}

const LicenseCard = ({ license, messages, query = "" }: Props) => (
  <div className="usa-card__container margin-bottom-3">
    <div className="usa-card__header">
      <h3 className="usa-card__heading">
        <HighlightedText text={license.name} query={query} />
      </h3>
      <p className="margin-top-1 text-base">
        {license.licenseCertificationClassification && (
          <>
            <strong>{messages.cardWhoForLabel}</strong> {license.licenseCertificationClassification}
          </>
        )}
        {license.industry && (
          <>
            {license.licenseCertificationClassification && " | "}
            <strong>{messages.cardIndustryLabel}</strong> {license.industry}
          </>
        )}
      </p>
    </div>
    <div className="usa-card__body">
      {license.summaryDescriptionMd && <Markdown>{license.summaryDescriptionMd}</Markdown>}
      {license.agency && (
        <p className="margin-bottom-1">
          <strong>{messages.cardAgencyLabel}</strong> {license.agency}
          {license.division ? `, ${license.division}` : ""}
        </p>
      )}
      {license.divisionPhone && (
        <p className="margin-bottom-0">
          <strong>{messages.cardPhoneLabel}</strong> {license.divisionPhone}
        </p>
      )}
    </div>
    {license.callToActionLink && (
      <div className="usa-card__footer">
        <a href={license.callToActionLink} className="usa-button">
          {license.callToActionText ?? license.callToActionLink}
        </a>
      </div>
    )}
  </div>
);

export default LicenseCard;
