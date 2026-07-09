import Markdown from "react-markdown";
import { Icon } from "@/components/Icon";
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

/**
 * Location-dependent roadmap tasks carry `${municipalityWebsite}`-style template
 * variables in their CTA that only the personalized `web` roadmap fills in from
 * the user's municipality. This static directory has no user, so they never
 * resolve; rendering them yields a dead link and a literal `${…}` label.
 */
const hasUnresolvedTemplate = (value: string | undefined): boolean =>
  value !== undefined && /\$\{[^}]+\}/.test(value);

const LicenseCard = ({ license, messages, query = "" }: Props) => {
  const rehypePlugins = query.trim() ? [makeHighlightPlugin(query)] : [];
  const whoItsFor = whoItsForLabel(license.webflowType, messages.whoItsForLabels);
  const industry = presentValue(license.industry);
  // The agency line shows the resolved agency name followed by its additional
  // context (division), comma-separated. Matching the published site, the agency
  // name links to the agency website when one is present; the division stays
  // plain text.
  const hasAgencyLine = Boolean(license.agency || license.division);
  const showCallToAction =
    license.callToActionLink !== undefined &&
    !hasUnresolvedTemplate(license.callToActionLink) &&
    !hasUnresolvedTemplate(license.callToActionText);

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
      <hr className="border-base-light border-top-1px margin-x-3 margin-y-1" />
      <div className="usa-card__body">
        {license.summaryDescriptionMd && (
          <Markdown rehypePlugins={rehypePlugins}>
            {stripContentDirectives(license.summaryDescriptionMd)}
          </Markdown>
        )}
        {license.summaryDescriptionMd && (hasAgencyLine || license.divisionPhone) && (
          <hr className="border-base-light border-top-1px margin-x-0 margin-y-1" />
        )}
        {hasAgencyLine && (
          <p className="margin-bottom-1 display-flex flex-align-start">
            <Icon
              iconName="account_balance"
              className="text-primary nj-margin-inline-end-05 nj-icon-text-top"
            />
            <span>
              <strong>{messages.cardAgencyLabel}</strong>{" "}
              {license.agency &&
                (license.agencyWebsite ? (
                  <a href={license.agencyWebsite} rel="noreferrer" target="_blank">
                    {license.agency}
                  </a>
                ) : (
                  license.agency
                ))}
              {license.agency && license.division && ", "}
              {license.division}
            </span>
          </p>
        )}
        {license.divisionPhone && (
          <p className="margin-bottom-0 display-flex flex-align-start">
            <Icon
              iconName="phone"
              className="text-primary nj-margin-inline-end-05 nj-icon-text-top"
            />
            <span>
              <strong>{messages.cardPhoneLabel}</strong> {license.divisionPhone}
            </span>
          </p>
        )}
      </div>
      {showCallToAction && (
        <>
          <hr className="border-base-light border-top-1px margin-x-3 margin-y-1" />
          <div className="usa-card__footer">
            <a href={license.callToActionLink} className="usa-button">
              {license.callToActionText ?? license.callToActionLink}
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default LicenseCard;
