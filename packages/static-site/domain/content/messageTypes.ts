/**
 * Declares typed content models used across the static site.
 *
 * These interfaces define the contract between localized messages, loaders,
 * and rendered UI sections.
 */

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
  /** Label for the "Clear" button inside each filter fieldset. */
  readonly filterClear: string;
  /** Label for the "Show Results" button; {count} is replaced at runtime. */
  readonly filterShowResults: string;
  /** Label for the "Reset" button. */
  readonly filterReset: string;
  /** Result count line; {filtered} (wrapped in <bold>) and {total} are substituted at runtime via t.rich. */
  readonly resultCount: string;
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
}
