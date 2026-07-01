import Markdown from "react-markdown";
import type { LicensingGuidePageMessages } from "@/domain/content/messageTypes";
import type { License } from "@/domain/content/types";
import { HighlightedText, makeHighlightPlugin } from "./highlightMatches";
import { stripContentDirectives } from "./stripContentDirectives";
import { whoItsForLabel } from "./whoItsForLabel";

interface Props {
  readonly license: License;
  readonly messages: LicensingGuidePageMessages;
  readonly query?: string;
}

/**
 * Returns the trimmed value, or undefined when it is blank or the literal
 * string "undefined" — both stand in for "no value" in the synced content and
 * must not be rendered as a label row.
 */
const presentValue = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed && trimmed !== "undefined" ? trimmed : undefined;
};

const LicenseCard = ({ license, messages, query = "" }: Props) => {
  const rehypePlugins = query.trim() ? [makeHighlightPlugin(query)] : [];
  const whoItsFor = whoItsForLabel(license.webflowType);
  const industry = presentValue(license.industry);

  return (
    <div className="usa-card__container margin-bottom-3">
      <div className="usa-card__header">
        <h3 className="usa-card__heading">
          <HighlightedText text={license.name} query={query} />
        </h3>
        {(whoItsFor || industry) && (
          <p className="margin-top-1">
            {whoItsFor && (
              <>
                <strong>{messages.cardWhoForLabel}</strong> {whoItsFor}
              </>
            )}
            {industry && (
              <>
                {whoItsFor && " | "}
                <strong>{messages.cardIndustryLabel}</strong> {industry}
              </>
            )}
          </p>
        )}
      </div>
      <div className="usa-card__body">
        {license.summaryDescriptionMd && (
          <Markdown rehypePlugins={rehypePlugins}>
            {stripContentDirectives(license.summaryDescriptionMd)}
          </Markdown>
        )}
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
};

export default LicenseCard;
