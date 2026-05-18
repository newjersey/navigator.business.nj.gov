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
  /** Label rendered on the responsive menu button. */
  readonly menuButtonLabel: string;
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
}

/**
 * Localized content for the hero section.
 */
export interface LandingHeroContent {
  /** Accessible label for the hero section landmark. */
  readonly sectionAriaLabel: string;
  /** Introductory callout text rendered above the hero title. */
  readonly callout: string;
  /** Hero heading text. */
  readonly title: string;
  /** Hero supporting paragraph text. */
  readonly paragraph: string;
  /** Primary hero call-to-action link. */
  readonly callToActionLink: ContentLink;
}

/**
 * Localized content for the tagline section.
 */
export interface LandingTaglineContent {
  /** Heading text for the tagline section. */
  readonly title: string;
  /** Paragraphs rendered in the tagline body column. */
  readonly paragraphs: readonly string[];
}

/**
 * Localized content for one graphic-list card.
 */
export interface LandingGraphicListItem {
  /** Heading text for the graphic-list item. */
  readonly title: string;
  /** Supporting paragraph text for the graphic-list item. */
  readonly paragraph: string;
  /** Alt text for the decorative image. */
  readonly imageAlt: string;
}

/**
 * Localized content for the dark graphic-list section.
 */
export interface LandingGraphicListContent {
  /** Items rendered in the graphic-list layout. */
  readonly items: readonly LandingGraphicListItem[];
}

/**
 * Localized content for the section call-to-action block.
 */
export interface LandingCallToActionContent {
  /** Element ID used as the CTA section anchor target. */
  readonly sectionId: string;
  /** Heading text rendered for the CTA section. */
  readonly title: string;
  /** Introductory paragraph rendered for the CTA section. */
  readonly intro: string;
  /** CTA button link metadata. */
  readonly callToActionLink: ContentLink;
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
  /** Footer section content. */
  readonly footer: LayoutFooterContent;
  /** Identifier section content. */
  readonly identifier: LayoutIdentifierContent;
}

/**
 * All localized content needed to render the landing page.
 */
export interface LandingPageContent {
  /** Hero section content. */
  readonly hero: LandingHeroContent;
  /** Tagline section content. */
  readonly tagline: LandingTaglineContent;
  /** Graphic-list section content. */
  readonly graphicList: LandingGraphicListContent;
  /** CTA section content. */
  readonly callToAction: LandingCallToActionContent;
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
export interface LearnSideNavContent {
  /** Accessible name for the section. */
  readonly ariaLabel: string;
  /** Ordered list of pages rendered in the side navigation. */
  readonly pages: readonly ContentLink[];
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
}

/**
 * One card rendered in the learn page grid.
 */
export interface LearnCard {
  /** Heading text for the card. */
  readonly title: string;
  /** Supporting text rendered in the card. */
  readonly description: string;
  /** Link metadata for the card CTA. */
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
  /** Secondary heading text rendered above the cards grid. */
  readonly heading2: string;
  /** Side navigation content for the learn section. */
  readonly sideNav: LearnSideNavContent;
  /** Category metadata keyed to route segments. */
  readonly categories: readonly LearnCategory[];
  /** Cards rendered in the learn grid. */
  readonly cards: readonly LearnCard[];
  /** Shared strings used across category pages. */
  readonly categoryPages: LearnCategoryPagesContent;
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
}
