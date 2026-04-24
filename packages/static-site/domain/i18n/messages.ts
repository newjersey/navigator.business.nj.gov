/**
 * Loads and validates localized message payloads for the static site.
 *
 * This module is the single boundary between raw JSON imports and typed
 * application messages used by routes and components.
 */

import type { ApplicationMessages } from "@/domain/landing/types";
import enUsMessagesData from "@/messages/en-US.json";
import esUsMessagesData from "@/messages/es-US.json";
import type { AppLocale } from "./locales";
import { resolveAppLocale } from "./locales";

/**
 * Describes input used to fetch messages for a known valid locale.
 *
 * Callers should pass an `AppLocale` that already passed locale checks.
 */
export interface GetApplicationMessagesParams {
  /** Locale code for selecting localized message content. */
  readonly locale: AppLocale;
}

/**
 * Describes input used to fetch messages from an untrusted locale value.
 *
 * This shape is used at route and request boundaries where locale data might
 * be missing or malformed.
 */
export interface GetApplicationMessagesForUnknownLocaleParams {
  /** Locale candidate from routing or request data. */
  readonly locale: string | undefined;
}

/**
 * Describes input used to validate one locale JSON payload.
 *
 * Validation runs once at module load to fail fast on bad message structure.
 */
interface EnsureApplicationMessagesParams {
  /** Locale associated with the message payload. */
  readonly locale: AppLocale;
  /** Unknown payload imported from JSON. */
  readonly payload: unknown;
}

/**
 * Checks if a value matches the header submenu-link shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the value includes a valid `link` object.
 * @example
 * ```ts
 * const isValid = isHeaderSubmenuLinkRecord(candidate);
 * ```
 */
const isHeaderSubmenuLinkRecord = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isLandingLink(value.link);
};

/**
 * Checks if a value is a non-null object record.
 *
 * @param value Unknown value to validate.
 * @returns `true` when `value` is an object and not `null`.
 * @example
 * ```ts
 * const isObject = isRecord(payload);
 * ```
 */
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/**
 * Checks if a value is a string.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the value is a string.
 * @example
 * ```ts
 * const isText = isString(value);
 * ```
 */
const isString = (value: unknown): value is string => {
  return typeof value === "string";
};

/**
 * Checks if a value is a boolean.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the value is a boolean.
 * @example
 * ```ts
 * const isFlag = isBoolean(value);
 * ```
 */
const isBoolean = (value: unknown): value is boolean => {
  return typeof value === "boolean";
};

/**
 * Checks if a value is an array of strings.
 *
 * @param value Unknown value to validate.
 * @returns `true` when every array item is a string.
 * @example
 * ```ts
 * const isLines = isStringArray(payload);
 * ```
 */
const isStringArray = (value: unknown): value is readonly string[] => {
  return Array.isArray(value) && value.every(isString);
};

/**
 * Checks if a value matches the landing-link shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when required link fields are present and typed correctly.
 * @example
 * ```ts
 * const isValidLink = isLandingLink(candidate);
 * ```
 */
const isLandingLink = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.label) &&
    isString(value.href) &&
    isBoolean(value.isInternal) &&
    isBoolean(value.opensInNewTab)
  );
};

/**
 * Checks if a value matches a primary-link navigation item.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the item is a valid `kind: "link"` entry.
 * @example
 * ```ts
 * const isPrimaryLink = isHeaderPrimaryLinkItem(candidate);
 * ```
 */
const isHeaderPrimaryLinkItem = (value: unknown): boolean => {
  if (!isRecord(value) || value.kind !== "link") {
    return false;
  }

  return isLandingLink(value.link) && isBoolean(value.isCurrent);
};

/**
 * Checks if a value matches a primary submenu navigation item.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the item is a valid `kind: "submenu"` entry.
 * @example
 * ```ts
 * const isPrimarySubmenu = isHeaderPrimarySubmenuItem(candidate);
 * ```
 */
const isHeaderPrimarySubmenuItem = (value: unknown): boolean => {
  if (!isRecord(value) || value.kind !== "submenu") {
    return false;
  }

  const links = value.links;
  if (!Array.isArray(links)) {
    return false;
  }

  const hasValidLinks = links.every(isHeaderSubmenuLinkRecord);

  return (
    isString(value.label) &&
    isString(value.submenuId) &&
    isBoolean(value.isCurrent) &&
    hasValidLinks
  );
};

/**
 * Checks if a value matches any valid primary header item variant.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the value is either a link item or submenu item.
 * @example
 * ```ts
 * const isPrimaryItem = isHeaderPrimaryItem(candidate);
 * ```
 */
const isHeaderPrimaryItem = (value: unknown): boolean => {
  return isHeaderPrimaryLinkItem(value) || isHeaderPrimarySubmenuItem(value);
};

/**
 * Checks if a value matches a social-link payload.
 *
 * @param value Unknown value to validate.
 * @returns `true` when social-link fields are present and valid.
 * @example
 * ```ts
 * const isSocial = isLandingSocialLink(candidate);
 * ```
 */
const isLandingSocialLink = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.modifier) &&
    isLandingLink(value.link) &&
    isString(value.iconAlt) &&
    isString(value.iconPath)
  );
};

/**
 * Checks if a value matches a required identifier-link payload.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the payload wraps a valid landing link.
 * @example
 * ```ts
 * const isRequired = isLandingIdentifierRequiredLink(candidate);
 * ```
 */
const isLandingIdentifierRequiredLink = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isLandingLink(value.link);
};

/**
 * Checks if a value matches a footer primary-link payload.
 *
 * @param value Unknown value to validate.
 * @returns `true` when the payload wraps a valid landing link.
 * @example
 * ```ts
 * const isFooterLink = isLandingFooterPrimaryLink(candidate);
 * ```
 */
const isLandingFooterPrimaryLink = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isLandingLink(value.link);
};

/**
 * Checks if a value matches a graphic-list item payload.
 *
 * @param value Unknown value to validate.
 * @returns `true` when title, paragraph, and image text are valid strings.
 * @example
 * ```ts
 * const isGraphicItem = isLandingGraphicListItem(candidate);
 * ```
 */
const isLandingGraphicListItem = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.title) && isString(value.paragraph) && isString(value.imageAlt);
};

/**
 * Checks if a value matches the landing banner content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when banner labels and links are valid.
 * @example
 * ```ts
 * const isBanner = isLandingBannerContent(candidate);
 * ```
 */
const isLandingBannerContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.sectionAriaLabel) &&
    isString(value.stateSealAlt) &&
    isLandingLink(value.stateSiteLink) &&
    isLandingLink(value.governorIdentityLink) &&
    isLandingLink(value.updatesLink)
  );
};

/**
 * Checks if a value matches the landing header content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when header labels, links, and navigation items are valid.
 * @example
 * ```ts
 * const isHeader = isLandingHeaderContent(candidate);
 * ```
 */
const isLandingHeaderContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidPrimaryItems =
    Array.isArray(value.primaryItems) && value.primaryItems.every(isHeaderPrimaryItem);
  const hasValidSecondaryLinks =
    Array.isArray(value.secondaryLinks) && value.secondaryLinks.every(isLandingLink);

  return (
    isString(value.primaryNavigationAriaLabel) &&
    isLandingLink(value.homeLink) &&
    isString(value.homeLinkTitle) &&
    isString(value.homeLinkAriaLabel) &&
    isString(value.siteTitle) &&
    isString(value.menuButtonLabel) &&
    isString(value.closeButtonAlt) &&
    hasValidPrimaryItems &&
    hasValidSecondaryLinks &&
    isString(value.searchAction) &&
    isString(value.searchInputLabel) &&
    isString(value.searchSubmitIconAlt)
  );
};

/**
 * Checks if a value matches the landing hero content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when hero text and CTA link are valid.
 * @example
 * ```ts
 * const isHero = isLandingHeroContent(candidate);
 * ```
 */
const isLandingHeroContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.sectionAriaLabel) &&
    isString(value.callout) &&
    isString(value.title) &&
    isString(value.paragraph) &&
    isLandingLink(value.callToActionLink)
  );
};

/**
 * Checks if a value matches the landing tagline content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when title and paragraph list are valid.
 * @example
 * ```ts
 * const isTagline = isLandingTaglineContent(candidate);
 * ```
 */
const isLandingTaglineContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.title) && isStringArray(value.paragraphs);
};

/**
 * Checks if a value matches the landing graphic-list content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when each graphic-list item is valid.
 * @example
 * ```ts
 * const isGraphicList = isLandingGraphicListContent(candidate);
 * ```
 */
const isLandingGraphicListContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return Array.isArray(value.items) && value.items.every(isLandingGraphicListItem);
};

/**
 * Checks if a value matches the landing call-to-action content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when CTA fields are present and valid.
 * @example
 * ```ts
 * const isCta = isLandingCallToActionContent(candidate);
 * ```
 */
const isLandingCallToActionContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.sectionId) &&
    isString(value.title) &&
    isString(value.intro) &&
    isLandingLink(value.callToActionLink)
  );
};

/**
 * Checks if a value matches the landing footer content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when footer links, labels, and contact fields are valid.
 * @example
 * ```ts
 * const isFooter = isLandingFooterContent(candidate);
 * ```
 */
const isLandingFooterContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidPrimaryLinks =
    Array.isArray(value.primaryLinks) && value.primaryLinks.every(isLandingFooterPrimaryLink);
  const hasValidSocialLinks =
    Array.isArray(value.socialLinks) && value.socialLinks.every(isLandingSocialLink);

  return (
    isString(value.returnToTopLabel) &&
    isString(value.navigationAriaLabel) &&
    hasValidPrimaryLinks &&
    isString(value.agencyLogoAlt) &&
    isString(value.agencyName) &&
    hasValidSocialLinks &&
    isString(value.contactHeading) &&
    isLandingLink(value.phoneLink) &&
    isLandingLink(value.emailLink)
  );
};

/**
 * Checks if a value matches the landing identifier content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when identifier labels and required links are valid.
 * @example
 * ```ts
 * const isIdentifier = isLandingIdentifierContent(candidate);
 * ```
 */
const isLandingIdentifierContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  const hasValidRequiredLinks =
    Array.isArray(value.requiredLinks) &&
    value.requiredLinks.every(isLandingIdentifierRequiredLink);

  return (
    isString(value.agencySectionAriaLabel) &&
    isString(value.stateLogoAlt) &&
    isString(value.agencyLogoAlt) &&
    isString(value.domain) &&
    isString(value.disclaimerPrefix) &&
    isLandingLink(value.disclaimerLink) &&
    isString(value.importantLinksAriaLabel) &&
    hasValidRequiredLinks &&
    isString(value.usGovernmentSectionAriaLabel) &&
    isString(value.usGovernmentDescription)
  );
};

/**
 * Checks if a value matches the full landing page content shape.
 *
 * @param value Unknown value to validate.
 * @returns `true` when all landing sections are present and valid.
 * @example
 * ```ts
 * const isLanding = isLandingPageContent(candidate);
 * ```
 */
const isLandingPageContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.skipNavigationLabel) &&
    isString(value.mainContentId) &&
    isLandingBannerContent(value.banner) &&
    isLandingHeaderContent(value.header) &&
    isLandingHeroContent(value.hero) &&
    isLandingTaglineContent(value.tagline) &&
    isLandingGraphicListContent(value.graphicList) &&
    isLandingCallToActionContent(value.callToAction) &&
    isLandingFooterContent(value.footer) &&
    isLandingIdentifierContent(value.identifier)
  );
};

/**
 * Checks if a value matches landing metadata content.
 *
 * @param value Unknown value to validate.
 * @returns `true` when title and description are valid strings.
 * @example
 * ```ts
 * const isMetadata = isLandingMetadataContent(candidate);
 * ```
 */
const isLandingMetadataContent = (value: unknown): boolean => {
  if (!isRecord(value)) {
    return false;
  }

  return isString(value.title) && isString(value.description);
};

/**
 * Checks if a value matches the complete application message schema.
 *
 * @param value Unknown value to validate.
 * @returns `true` when metadata and landing payloads are both valid.
 * @example
 * ```ts
 * const isMessages = isApplicationMessages(candidate);
 * ```
 */
const isApplicationMessages = (value: unknown): value is ApplicationMessages => {
  if (!isRecord(value)) {
    return false;
  }

  return isLandingMetadataContent(value.metadata) && isLandingPageContent(value.landing);
};

/**
 * Validates one locale payload and returns typed application messages.
 *
 * @param params Validation input.
 * @param params.locale Locale tied to the payload for clear errors.
 * @param params.payload Unknown payload imported from JSON.
 * @returns Strongly typed application messages for the locale.
 * @throws {Error} Thrown when the payload does not match the schema.
 * @example
 * ```ts
 * const messages = ensureApplicationMessages({ locale: "en-US", payload: rawPayload });
 * ```
 */
const ensureApplicationMessages = ({
  locale,
  payload,
}: EnsureApplicationMessagesParams): ApplicationMessages => {
  if (!isApplicationMessages(payload)) {
    throw new Error(`Invalid message payload for locale: ${locale}`);
  }

  return payload;
};

const EN_US_MESSAGES = ensureApplicationMessages({
  locale: "en-US",
  payload: enUsMessagesData as unknown,
});

const ES_US_MESSAGES = ensureApplicationMessages({
  locale: "es-US",
  payload: esUsMessagesData as unknown,
});

const APPLICATION_MESSAGES_BY_LOCALE: Readonly<Record<AppLocale, ApplicationMessages>> = {
  "en-US": EN_US_MESSAGES,
  "es-US": ES_US_MESSAGES,
};

/**
 * Returns application messages for a validated locale.
 *
 * @param params Message lookup input.
 * @param params.locale Locale already validated as `AppLocale`.
 * @returns Localized application messages for the locale.
 * @example
 * ```ts
 * const messages = getApplicationMessages({ locale: "en-US" });
 * ```
 */
export const getApplicationMessages = ({
  locale,
}: GetApplicationMessagesParams): ApplicationMessages => {
  return APPLICATION_MESSAGES_BY_LOCALE[locale];
};

/**
 * Returns application messages for raw locale input.
 *
 * The locale is resolved through fallback rules before message lookup.
 *
 * @param params Message lookup input.
 * @param params.locale Raw locale value from routing or request state.
 * @returns Localized application messages for the resolved locale.
 * @example
 * ```ts
 * const messages = getApplicationMessagesForUnknownLocale({ locale: "fr-FR" });
 * ```
 */
export const getApplicationMessagesForUnknownLocale = ({
  locale,
}: GetApplicationMessagesForUnknownLocaleParams): ApplicationMessages => {
  const resolvedLocale = resolveAppLocale({ locale });

  return getApplicationMessages({ locale: resolvedLocale });
};
