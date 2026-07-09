/**
 * Declares typed content models used across the static site.
 *
 * These interfaces define the contract between localized messages, loaders,
 * and rendered UI sections.
 */

import type { FundingType } from "./types";

/**
 * A localized link used by landing-page components.
 */
export interface ContentLink {
  /** Human-readable link label rendered in UI. */
  readonly label: string;
  /** URL or path destination for the link. */
  readonly href: string;
  /** Indicates the link should use internal app navigation. */
  readonly isInternal: boolean;
  /** Indicates the link should open in a new browser tab. */
  readonly opensInNewTab: boolean;
  /** Some links need a string key identifier to help us construct link categories */
  readonly key?: string;
}

/**
 * One item in the header primary submenu.
 */
export interface HeaderPrimarySubmenuLink {
  /** Link metadata rendered in the submenu. */
  readonly link: ContentLink;
}

/**
 * A primary navigation item that renders as a simple link.
 */
export interface HeaderPrimaryLinkItem {
  /** Discriminator for a simple link item. */
  readonly kind: "link";
  /** Link metadata rendered in the primary navigation. */
  readonly link: ContentLink;
  /** Indicates the link points to the current section/page. */
  readonly isCurrent: boolean;
}

/**
 * A primary navigation item that renders a submenu accordion trigger.
 */
export interface HeaderPrimarySubmenuItem {
  /** Discriminator for a submenu item. */
  readonly kind: "submenu";
  /** Label rendered in the accordion trigger. */
  readonly label: string;
  /** Element ID used for the submenu container. */
  readonly submenuId: string;
  /** Indicates the trigger points to the current section/page. */
  readonly isCurrent: boolean;
  /** Child links rendered inside the submenu. */
  readonly links: readonly HeaderPrimarySubmenuLink[];
}

/**
 * A primary navigation item rendered in the NJWDS header.
 */
export type HeaderPrimaryItem = HeaderPrimaryLinkItem | HeaderPrimarySubmenuItem;

/**
 * Localized content for the government identity banner.
 */
export interface LayoutBannerContent {
  /** Accessible label for the banner section landmark. */
  readonly sectionAriaLabel: string;
  /** Alt text for the New Jersey state seal image. */
  readonly stateSealAlt: string;
  /** Link to the official New Jersey state site. */
  readonly stateSiteLink: ContentLink;
  /** Link displaying the governor and lieutenant governor names. */
  readonly governorIdentityLink: ContentLink;
  /** Link to the state updates subscription destination. */
  readonly updatesLink: ContentLink;
}

/**
 * Localized content for the NJWDS extended header.
 */
export interface LayoutHeaderContent {
  /** Accessible label for the primary navigation region. */
  readonly primaryNavigationAriaLabel: string;
  /** Home link metadata rendered in the logo area. */
  readonly homeLink: ContentLink;
  /** Title attribute for the home link. */
  readonly homeLinkTitle: string;
  /** Aria label for the home link. */
  readonly homeLinkAriaLabel: string;
  /** Site title text rendered in the logo area. */
  readonly siteTitle: string;
  /** Alt text for the site logo image. */
  readonly logoAlt: string;
  /** Alt text for the close icon in primary navigation. */
  readonly closeButtonAlt: string;
  /** Collection of primary navigation items. */
  readonly primaryItems: readonly HeaderPrimaryItem[];
  /** Collection of secondary navigation links. */
  readonly secondaryLinks: readonly ContentLink[];
  /** Form action destination for the header search form. */
  readonly searchAction: string;
  /** Accessible label for the search input. */
  readonly searchInputLabel: string;
  /** Alt text for the search submit icon. */
  readonly searchSubmitIconAlt: string;
  /** Label for the Log In link. */
  readonly logInLabel: string;
  /** Label for the My Account button. */
  readonly myAccountLabel: string;
  /** Label for the Get Started dropdown item. */
  readonly getStartedLabel: string;
  /** Alt text for the account avatar icon. */
  readonly accountIconAlt: string;
  /** Alt text for the dropdown arrow icon. */
  readonly dropdownArrowAlt: string;
  /** Accessible label for the mobile hamburger menu button. */
  readonly hamburgerButtonAriaLabel: string;
  /** Accessible label for the mobile account icon button. */
  readonly mobileAccountButtonAriaLabel: string;
  /** Title shown in the mobile nav drawer header. */
  readonly navDrawerTitle: string;
  /** Accessible label for the close button inside a mobile drawer. */
  readonly closeDrawerAriaLabel: string;
}

/**
 * One image in the hero carousel.
 */
export interface HeroCarouselImage {
  /** Public path to the carousel image. */
  readonly src: string;
  /** Alt text for the carousel image. */
  readonly alt: string;
}

/**
 * Localized content for the hero section.
 */
export interface LandingHeroContent {
  /** Accessible label for the hero section landmark. */
  readonly sectionAriaLabel: string;
  /** Hero heading text. */
  readonly title: string;
  /** Hero supporting paragraph text. */
  readonly paragraph: string;
  /** Primary hero call-to-action link. */
  readonly callToActionLink: ContentLink;
  /** Images displayed in the hero carousel. */
  readonly carouselImages: readonly HeroCarouselImage[];
}

/**
 * Localized content for one footer social link.
 */
export interface LandingSocialLink {
  /** Class name modifier suffix for NJWDS social icon styling. */
  readonly modifier: string;
  /** Link metadata for the social destination. */
  readonly link: ContentLink;
  /** Alt text for the social icon image. */
  readonly iconAlt: string;
  /** Path to the social icon asset. */
  readonly iconPath: string;
}

/**
 * Localized content for one footer primary link.
 */
export interface LandingFooterPrimaryLink {
  /** Link metadata rendered in the footer primary nav list. */
  readonly link: ContentLink;
}

/**
 * Localized content for the footer section.
 */
export interface LayoutFooterContent {
  /** Label for the return-to-top link. */
  readonly returnToTopLabel: string;
  /** Accessible label for footer navigation. */
  readonly navigationAriaLabel: string;
  /** Primary footer links rendered in the first row. */
  readonly primaryLinks: readonly LandingFooterPrimaryLink[];
  /** Alt text for the agency logo image. */
  readonly agencyLogoAlt: string;
  /** Agency name heading rendered near the logo. */
  readonly agencyName: string;
  /** Social links rendered in the footer secondary row. */
  readonly socialLinks: readonly LandingSocialLink[];
  /** Contact heading rendered above phone/email links. */
  readonly contactHeading: string;
  /** Contact center phone link metadata. */
  readonly phoneLink: ContentLink;
  /** Contact center email link metadata. */
  readonly emailLink: ContentLink;
}

/**
 * Localized content for one required identifier link.
 */
export interface LandingIdentifierRequiredLink {
  /** Link metadata rendered in the required-links list. */
  readonly link: ContentLink;
}

/**
 * Localized content for the identifier section.
 */
export interface LayoutIdentifierContent {
  /** Accessible label for the agency identifier section. */
  readonly agencySectionAriaLabel: string;
  /** Alt text for the state logo image. */
  readonly stateLogoAlt: string;
  /** Alt text for the agency logo image. */
  readonly agencyLogoAlt: string;
  /** Domain text rendered in the identifier block. */
  readonly domain: string;
  /** Prefix text rendered before the state link in disclaimer copy. */
  readonly disclaimerPrefix: string;
  /** Link metadata rendered in disclaimer copy. */
  readonly disclaimerLink: ContentLink;
  /** Accessible label for the required links navigation. */
  readonly importantLinksAriaLabel: string;
  /** Required links rendered in identifier navigation. */
  readonly requiredLinks: readonly LandingIdentifierRequiredLink[];
  /** Contact Us button text that launches Intercom when clicked. */
  readonly contactUs: string;
  /** Accessible label for the U.S. government information section. */
  readonly usGovernmentSectionAriaLabel: string;
  /** Description text rendered in the U.S. government section. */
  readonly usGovernmentDescription: string;
}

/**
 * Localized chrome for the header language switcher control.
 *
 * Shown in the viewer's current language. Language option labels themselves are
 * autonyms drawn from `LANGUAGE_DESCRIPTORS`, not from this content.
 */
export interface LayoutLanguageSwitcherContent {
  /** Accessible label for the language navigation region. */
  readonly navigationAriaLabel: string;
  /** Label shown on the dropdown trigger button. */
  readonly buttonLabel: string;
  /** Visually-hidden suffix marking the currently active language option. */
  readonly currentLanguageLabel: string;
}

/**
 * Localized copy for the preferred-language prompt modal.
 *
 * Shown in the page's current language; `redirectLabel` is a template whose
 * `{language}` placeholder is filled with the target language's autonym.
 */
export interface LayoutLanguagePromptContent {
  /** Modal heading text. */
  readonly title: string;
  /** Body text explaining the language choice offered. */
  readonly body: string;
  /** Label for the button that keeps the visitor on the current page. */
  readonly stayLabel: string;
  /** Accessible label for the modal close control. */
  readonly closeLabel: string;
  /** Redirect button template containing a `{language}` placeholder. */
  readonly redirectLabel: string;
}

/**
 * Shared localized content rendered on every page of the site.
 */
export interface LayoutContent {
  /** Label text rendered by the skip navigation link. */
  readonly skipNavigationLabel: string;
  /** Element ID used for main-content anchor navigation. */
  readonly mainContentId: string;
  /** Banner section content. */
  readonly banner: LayoutBannerContent;
  /** Header section content. */
  readonly header: LayoutHeaderContent;
  /** Language switcher chrome content. */
  readonly languageSwitcher: LayoutLanguageSwitcherContent;
  /** Preferred-language prompt modal content. */
  readonly languagePrompt: LayoutLanguagePromptContent;
  /** Footer section content. */
  readonly footer: LayoutFooterContent;
  /** Identifier section content. */
  readonly identifier: LayoutIdentifierContent;
}

/**
 * One item in the Quick Services grid.
 */
export interface QuickServicesItem {
  /** Card heading text. */
  readonly title: string;
  /** Card supporting description text. */
  readonly description: string;
  /** Path to the card icon image. */
  readonly iconPath: string;
  /** Alt text for the card icon. */
  readonly iconAlt: string;
  /** Link destination for the card. */
  readonly link: ContentLink;
}

/**
 * Localized content for the Quick Services section.
 */
export interface QuickServicesContent {
  /** Section heading text. */
  readonly title: string;
  /** Section subtitle text. */
  readonly subtitle: string;
  /** Cards rendered in the quick services grid. */
  readonly items: readonly QuickServicesItem[];
}

/**
 * Localized content for the CTA banner section.
 */
export interface CtaBannerContent {
  /** Banner heading text. */
  readonly title: string;
  /** Banner subtitle text. */
  readonly subtitle: string;
  /** CTA button link metadata. */
  readonly callToActionLink: ContentLink;
}

/**
 * Localized content for the What's New section.
 */
export interface WhatsNewContent {
  /** Section heading text. */
  readonly title: string;
  /** Link to view all updates. */
  readonly viewAllLink: ContentLink;
}

/**
 * One card in the For More Support section.
 */
export interface SupportCard {
  /** Card heading text. */
  readonly title: string;
  /** Card description text. */
  readonly description: string;
  /** Path to the card icon image. */
  readonly iconPath: string;
  /** Alt text for the card icon. */
  readonly iconAlt: string;
  /** CTA link for the card. */
  readonly link: ContentLink;
}

/**
 * Localized content for the For More Support section.
 */
export interface SupportSectionContent {
  /** Section heading text. */
  readonly title: string;
  /** Section description paragraph. */
  readonly description: string;
  /** Support cards rendered in the section. */
  readonly cards: readonly SupportCard[];
}

/**
 * One agency in the Brought to You By section.
 */
export interface BroughtToYouByAgency {
  /** Agency display name. */
  readonly name: string;
  /** Path to the agency logo image. */
  readonly logo: string;
  /** Alt text for the agency logo. */
  readonly logoAlt: string;
  /** Link to the agency website. */
  readonly link: ContentLink;
}

/**
 * Localized content for the Brought to You By section.
 */
export interface BroughtToYouByContent {
  /** Section heading text. */
  readonly title: string;
  /** Agencies displayed in the section. */
  readonly agencies: readonly BroughtToYouByAgency[];
}

/**
 * Localized content for the feedback bar.
 */
export interface FeedbackBarContent {
  /** Question text displayed to the user. */
  readonly question: string;
  /** Label for the affirmative button. */
  readonly yesLabel: string;
  /** Label for the negative button. */
  readonly noLabel: string;
}

/**
 * All localized content needed to render the landing page.
 */
export interface LandingPageContent {
  /** Hero section content. */
  readonly hero: LandingHeroContent;
  /** Quick Services section content. */
  readonly quickServices: QuickServicesContent;
  /** CTA banner section content. */
  readonly ctaBanner: CtaBannerContent;
  /** What's New section content. */
  readonly whatsNew: WhatsNewContent;
  /** For More Support section content. */
  readonly support: SupportSectionContent;
  /** Brought to You By section content. */
  readonly broughtToYouBy: BroughtToYouByContent;
  /** Feedback bar content. */
  readonly feedbackBar: FeedbackBarContent;
}

/**
 * Localized metadata content for the root document.
 */
export interface LandingMetadataContent {
  /** Document title used in metadata. */
  readonly title: string;
  /** Document description used in metadata. */
  readonly description: string;
}

/**
 * Localized content for the learn section side navigation.
 */
export interface LearnSideNav {
  /** Accessible name for the section. */
  readonly ariaLabel: string;
  /** Label for the button that reveals all categories. */
  readonly showFullMenuLabel: string;
  /** Label for the button that hides non-current categories. */
  readonly hideFullMenuLabel: string;
  /** The top-level "Introduction" entry linking to /learn. */
  readonly learnCategory: LearnCategory;
}

/**
 * One category entry in the learn section, keyed to a route segment.
 */
export interface LearnCategory {
  /** Route key matching the [category] segment (e.g. "plan", "start"). */
  readonly key: string;
  /** Heading title for the category page. */
  readonly title: string;
  /** Subtitle text rendered below the category page title. */
  readonly subtitle: string;
  /** Link metadata for the category. */
  readonly link: ContentLink;
}

/**
 * Localized strings shared across all category pages.
 */
export interface LearnCategoryPagesContent {
  /** Label for the "all topics" navigation link. */
  readonly allTopics: string;
}

/**
 * A featured industry displayed on the starter kits page.
 */
export interface StarterKitIndustry {
  /** Display name of the industry. */
  readonly name: string;
  /** Identifier used to construct the onboarding URL. */
  readonly id: string;
  /** Short description shown on the industry card. */
  readonly description: string;
  /** Label for the card's call-to-action link. */
  readonly ctaText: string;
}

/**
 * Localized content for the starter kits page.
 */
export interface StarterKitsContent {
  /** Heading displayed above the industry dropdown. */
  readonly industrySelectorHeading: string;
  /** Button label for the industry selector CTA. */
  readonly industrySelectorCta: string;
  /** Heading displayed above the top industries card grid. */
  readonly topIndustriesHeading: string;
  /** Featured industries shown as cards below the selector. */
  readonly topIndustries: readonly StarterKitIndustry[];
}

/**
 * All localized content needed to render the learn page.
 */
export interface LearnPageContent {
  /** Navigation name for the learn section. */
  readonly name: string;
  /** Subheading text rendered below the page title. */
  readonly subHeadingText: string;
  /** Second heading on the page */
  readonly heading2: string;
  /** Link text for each card */
  readonly cardLinkText: string;
  /** Side navigation content for the learn section. */
  readonly sideNav: LearnSideNav;
  /** Category metadata keyed to route segments. */
  readonly categories: readonly LearnCategory[];
  /** Shared strings used across category pages. */
  readonly categoryPages: LearnCategoryPagesContent;
  /** Starter kits page content. */
  readonly starterKits: StarterKitsContent;
}

/**
 * Localized content for the funding page.
 */
export interface FundingPageMessages {
  /** Page H1 title. */
  readonly title: string;
  /** Heading inside the "Find Funding Fit" CTA box. */
  readonly ctaHeading: string;
  /** Body text inside the "Find Funding Fit" CTA box. */
  readonly ctaBody: string;
  /** Label for the "Create Account" CTA button. */
  readonly ctaButton: string;
  /** Heading for the filter sidebar. */
  readonly filterHeading: string;
  /** Label for the search input. */
  readonly filterSearch: string;
  /** Label for the industry filter group. */
  readonly filterIndustry: string;
  /** Label for the funding type filter group. */
  readonly filterFundingType: string;
  /** Display labels for each funding type, keyed by its content value. */
  readonly fundingTypeLabels: Record<FundingType, string>;
  /** Label for the "Clear" button inside each filter fieldset. */
  readonly filterClear: string;
  /** Label for the "Show Results" button; {count} is replaced at runtime. */
  readonly filterShowResults: string;
  /** Label for the "Reset" button. */
  readonly filterReset: string;
  /** Unfiltered result-count line; {start}, {end} (range wrapped in <bold>), and {total}. */
  readonly resultCountShowing: string;
  /** Filtered result-count line; {start}, {end} (range wrapped in <bold>), {filtered}, and {total}. */
  readonly resultCountFiltered: string;
  /** Result-count line when the filtered set is empty; {total}. */
  readonly resultCountFilteredEmpty: string;
  /** Label preceding the filter chips ("Filtering by:"). */
  readonly filteringByLabel: string;
  /** Chip label for the active search query; {query} is replaced at runtime. */
  readonly filterSearchChip: string;
  /** aria-label template for chip remove buttons; {filter} is replaced at runtime. */
  readonly filterRemoveLabel: string;
  /** Label for pagination "Previous" control. */
  readonly paginationPrevious: string;
  /** Label for pagination "Next" control. */
  readonly paginationNext: string;
  /** aria-label for the pagination navigation landmark. */
  readonly paginationLabel: string;
  /** aria-label template for a numbered page button; {page} is replaced at runtime. */
  readonly paginationPageLabel: string;
  /** Prefix label for a funding's due date on the card. */
  readonly cardDueLabel: string;
  /** Heading for the eligibility section on a funding card. */
  readonly cardEligibilityHeading: string;
  /** Heading for the benefits callout on a funding card. */
  readonly cardBenefitsHeading: string;
}

/**
 * Localized content for the Licensing and Certification Guide page.
 */
export interface LicensingGuidePageMessages {
  /** Page H1 title. */
  readonly title: string;
  /** Heading inside the CTA box. */
  readonly ctaHeading: string;
  /** Body text inside the CTA box. */
  readonly ctaBody: string;
  /** Label for the CTA button. */
  readonly ctaButton: string;
  /** Heading for the filter sidebar. */
  readonly filterHeading: string;
  /** Label for the search input. */
  readonly filterSearch: string;
  /** Label for the "Show Results" button; {count} is replaced at runtime. */
  readonly filterShowResults: string;
  /** Label for the "Reset" button. */
  readonly filterReset: string;
  /** Unfiltered result-count line; {start}, {end} (range wrapped in <bold>), and {total}. */
  readonly resultCountShowing: string;
  /** Filtered result-count line; {start}, {end} (range wrapped in <bold>), {filtered}, and {total}. */
  readonly resultCountFiltered: string;
  /** Result-count line when the filtered set is empty; {total}. */
  readonly resultCountFilteredEmpty: string;
  /** Label preceding the filter chips ("Filtering by:"). */
  readonly filteringByLabel: string;
  /** Chip label for the active search query; {query} is replaced at runtime. */
  readonly filterSearchChip: string;
  /** aria-label template for chip remove buttons; {filter} is replaced at runtime. */
  readonly filterRemoveLabel: string;
  /** Label for pagination "Previous" control. */
  readonly paginationPrevious: string;
  /** Label for pagination "Next" control. */
  readonly paginationNext: string;
  /** aria-label for the pagination navigation landmark. */
  readonly paginationLabel: string;
  /** aria-label template for a numbered page button; {page} is replaced at runtime. */
  readonly paginationPageLabel: string;
  /** Prefix label for the "Who it's for" field on a license card. */
  readonly cardWhoForLabel: string;
  /** Prefix label for the industry field on a license card. */
  readonly cardIndustryLabel: string;
  /** Prefix label for the agency field on a license card. */
  readonly cardAgencyLabel: string;
  /** Prefix label for the phone field on a license card. */
  readonly cardPhoneLabel: string;
  /**
   * "Who it's for" display labels keyed by a license's Webflow classification
   * (`webflowType`). A key present here is shown; an unmapped `webflowType`
   * omits the row.
   */
  readonly whoItsForLabels: Record<string, string>;
}

/**
 * Localized content for the 404 (page not found) page.
 */
export interface PageNotFoundContent {
  /** Alt text for the 404 illustration. */
  readonly iconAlt: string;
  /** Page H1 title. */
  readonly title: string;
  /** Description text shown below the title. */
  readonly description: string;
  /** Text before the home page link, e.g. "You can return to the". */
  readonly returnToPrefix: string;
  /** Link back to the home page. */
  readonly homeLink: ContentLink;
  /** Text joining the two links, e.g. "or". */
  readonly orConnector: string;
  /** Label for the Intercom chat launcher link. */
  readonly chatWithExpertLabel: string;
}

/**
 * Visual treatment applied to one stat, per the design.
 *
 * "plain" renders as a bulleted line of prose with the bolded figure in
 * --color-primary blue; "dark" renders as a full-width dark callout block
 * (matching `usa-section--dark`) with the bolded figure in teal. Defaults to
 * "plain" when omitted.
 */
export type ImpactReportStatVariant = "plain" | "dark";

/**
 * One statistic rendered in an impact report stat group.
 */
export interface ImpactReportStat {
  /** Full sentence as markdown, with the statistic bolded (e.g. "**502,994** visits to…"). */
  readonly text: string;
  /** Visual treatment for this stat; defaults to "plain". */
  readonly variant?: ImpactReportStatVariant;
  /** Renders the leading bold figure as a large block when set. */
  readonly emphasis?: "lead";
}

/**
 * One highlighted quote rendered in an impact report section.
 */
export interface ImpactReportQuote {
  /** Quote text. */
  readonly text: string;
  /** Attribution rendered below the quote. */
  readonly attribution: string;
}

/**
 * One photo rendered alongside text in an impact report section.
 */
export interface ImpactReportImage {
  /** Public path to the image asset. */
  readonly src: string;
  /** Alt text describing the image for screen reader users. */
  readonly alt: string;
}

/**
 * Localized content for the impact report's "About Us" section.
 */
export interface AboutUsContent {
  /** Section heading text. */
  readonly heading: string;
  /** Introductory paragraph rendered full-width; markdown, supports **bold** spans. */
  readonly introParagraph: string;
  /** Paragraph (including the bulleted resource list) paired with `image` in a two-column row; markdown. */
  readonly resourcesParagraph: string;
  /** Photo rendered beside `resourcesParagraph`. */
  readonly image: ImpactReportImage;
  /** Closing paragraph rendered full-width after the image row; markdown. */
  readonly closingParagraph: string;
  /** Highlighted quote rendered above the stats. */
  readonly quote: ImpactReportQuote;
  /** Stat tiles rendered at the bottom of the section. */
  readonly stats: readonly ImpactReportStat[];
}

/**
 * Localized content for the impact report's "Making it Easier to Start and
 * Grow a Business" section.
 */
export interface MakingItEasierContent {
  /** Section heading text. */
  readonly heading: string;
  /** Body paragraphs rendered before the stats; markdown, supports **bold** spans. */
  readonly beforeStatsParagraphs: readonly string[];
  /** Highlighted quote rendered at the top of the section. */
  readonly quote: ImpactReportQuote;
  /** Stats rendered in order; the "dark" one is the "…30% faster…" callout. */
  readonly stats: readonly ImpactReportStat[];
  /** Body paragraphs rendered after the stats; markdown, supports **bold** spans. */
  readonly afterStatsParagraphs: readonly string[];
}

/**
 * Localized content for the impact report's "Awareness of and Compliance
 * with Permits, Funding, and More" section.
 */
export interface AwarenessAndComplianceContent {
  /** Section heading text. */
  readonly heading: string;
  /** Body paragraphs rendered as markdown; supports **bold** spans. */
  readonly paragraphs: readonly string[];
  /** Stat tiles rendered within the section. */
  readonly stats: readonly ImpactReportStat[];
  /** Highlighted quote rendered at the bottom of the section. */
  readonly quote: ImpactReportQuote;
}

/**
 * One footnote rendered in the impact report's "Fostering Economic Growth" section.
 */
export interface ImpactReportFootnote {
  /** Identifier referenced by a `[^N]` marker in stat text. */
  readonly id: number;
  /** Footnote body as markdown. */
  readonly text: string;
}

/**
 * Localized content for the impact report's "Fostering Economic Growth" section.
 */
export interface FosteringEconomicGrowthContent {
  /** Section heading text. */
  readonly heading: string;
  /** Body paragraphs rendered as markdown; supports **bold** spans. */
  readonly paragraphs: readonly string[];
  /** Dark-callout stats rendered at the end of the section. */
  readonly stats: readonly ImpactReportStat[];
  /** Footnotes rendered as markdown at the end of the section, highlighted light-green. */
  readonly footnotes: readonly ImpactReportFootnote[];
}

/**
 * Localized content for the impact report's "Unifying the Customer Service
 * Experience" section.
 */
export interface CustomerServiceExperienceContent {
  /** Section heading text. */
  readonly heading: string;
  /** Body paragraphs rendered before the quote; markdown, supports **bold** spans. */
  readonly beforeQuoteParagraphs: readonly string[];
  /** Highlighted quote rendered within the section. */
  readonly quote: ImpactReportQuote;
  /** Body paragraphs rendered full-width after the quote, before the image row; markdown. */
  readonly afterQuoteParagraphs: readonly string[];
  /** Paragraphs paired with `image` in a two-column row; markdown, supports **bold** spans. */
  readonly imageRowParagraphs: readonly string[];
  /** Photo rendered beside `imageRowParagraphs`. */
  readonly image: ImpactReportImage;
  /** Stat tiles rendered within the section. */
  readonly stats: readonly ImpactReportStat[];
}

/**
 * Localized content for the impact report's "Driving Equity and
 * Accessibility" section.
 */
export interface DrivingEquityContent {
  /** Section heading text. */
  readonly heading: string;
  /** Body paragraphs rendered as markdown; supports **bold** spans. */
  readonly paragraphs: readonly string[];
  /** Stat tiles rendered within the section. */
  readonly stats: readonly ImpactReportStat[];
}

/**
 * Localized content for the impact report page.
 */
export interface ImpactReportMessages {
  /** Page H1 title. */
  readonly title: string;
  /** Year range for report. */
  readonly subtitle: string;
  /** Link to the downloadable PDF version of the report. */
  readonly downloadLink: ContentLink;
  /** "About Us" section content. */
  readonly aboutUs: AboutUsContent;
  /** "Making it Easier to Start and Grow a Business" section content. */
  readonly makingItEasier: MakingItEasierContent;
  /** "Awareness of and Compliance with Permits, Funding, and More" section content. */
  readonly awarenessAndCompliance: AwarenessAndComplianceContent;
  /** "Fostering Economic Growth" section content. */
  readonly fosteringEconomicGrowth: FosteringEconomicGrowthContent;
  /** "Unifying the Customer Service Experience" section content. */
  readonly customerServiceExperience: CustomerServiceExperienceContent;
  /** "Driving Equity and Accessibility" section content. */
  readonly drivingEquity: DrivingEquityContent;
}

/**
 * Complete localized message payload for one locale.
 */
export interface ApplicationMessages {
  /** Metadata strings for the localized route. */
  readonly metadata: LandingMetadataContent;
  /** Shared layout content for banner, header, footer, and identifier on all pages. */
  readonly layout: LayoutContent;
  /** Landing-page content strings and links. */
  readonly landing: LandingPageContent;
  /** Learn page content strings and links. */
  readonly learn: LearnPageContent;
  /** Funding page content strings. */
  readonly funding: FundingPageMessages;
  /** Licensing & Certification Guide page content strings. */
  readonly licensingGuide: LicensingGuidePageMessages;
  /** 404 page content strings and links. */
  readonly pageNotFound: PageNotFoundContent;
  /** Impact report page content strings. */
  readonly impactReport: ImpactReportMessages;
}
