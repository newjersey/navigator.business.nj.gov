/**
 * Implements the locale-scoped root layout and metadata behavior.
 *
 * This module validates route locale input, provides `next-intl` context,
 * injects NJWDS assets, and builds localized metadata.
 */

import "@/app/globals.css";
import "@/app/header.css";
import "@/app/landing.css";
import "@/app/funding.css";
import "@/app/impact-report.css";

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { Intercom } from "@/components/analytics/Intercom";
import { GovBanner } from "@/components/landing/GovBanner";
import { IdentifierSection } from "@/components/landing/IdentifierSection";
import { LanguagePromptModal } from "@/components/landing/LanguagePromptModal";
import { SiteFooter } from "@/components/landing/SiteFooter";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { SkipNav } from "@/components/landing/SkipNav";
import { textDirectionForLocale } from "@/domain/i18n/languages";
import { ENABLED_LOCALES, hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";
import { SITE_BASE_URL } from "@/domain/siteConfig";

/**
 * Stores the logo path used in metadata icons and social previews.
 */
const NJ_LOGO_IMAGE_PATH = "/assets/njwds/dist/img/nj-logo-gray-20.png";

/**
 * Public path for the synced NJWDS stylesheet.
 */
const NJWDS_STYLESHEET_PATH = "/assets/njwds/dist/css/styles.css";

/**
 * Public path for our flow-relative (RTL-aware) utility classes.
 *
 * Loaded immediately after the NJWDS stylesheet so these utilities win on
 * source order at equal specificity, letting them flip NJWDS's physical
 * directional properties under `dir="rtl"` without `!important`.
 */
const NJ_RTL_UTILITIES_STYLESHEET_PATH = "/styles/nj-rtl-utilities.css";

/**
 * Describes route params for locale-scoped pages.
 *
 * This type defines a stable shape for related data.
 */
export interface LocaleRouteParams {
  /** Locale segment captured from the route. */
  readonly locale: string;
}

/**
 * Describes props accepted by the locale layout component.
 *
 * This type defines a stable shape for related data.
 */
interface LocaleLayoutProps {
  /** Child route content rendered within the locale shell. */
  readonly children: ReactNode;
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<LocaleRouteParams>;
}

/**
 * Describes props accepted by locale metadata generation.
 *
 * This type defines a stable shape for related data.
 */
interface GenerateMetadataProps {
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<LocaleRouteParams>;
}

/**
 * Generates static route params for every supported locale.
 *
 * @returns Locale param objects for static route generation.
 * @example
 * ```ts
 * const params = generateStaticParams();
 * ```
 */
export const generateStaticParams = () => {
  return ENABLED_LOCALES.map((locale) => {
    return { locale };
  });
};

/**
 * Generates locale-specific metadata from localized content.
 *
 * @param props Metadata generation props.
 * @param props.params Async route params that include locale.
 * @returns Metadata with title, description, icons, and social fields.
 * @throws Error from `notFound()` when the locale segment is unsupported.
 * @example
 * ```ts
 * const metadata = await generateMetadata({
 *   params: Promise.resolve({ locale: "en-US" }),
 * });
 * ```
 */
export const generateMetadata = async ({ params }: GenerateMetadataProps): Promise<Metadata> => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const messages = await getApplicationMessages({ locale });

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
    metadataBase: new URL(SITE_BASE_URL),
    icons: {
      icon: NJ_LOGO_IMAGE_PATH,
      shortcut: NJ_LOGO_IMAGE_PATH,
      apple: NJ_LOGO_IMAGE_PATH,
    },
    openGraph: {
      title: messages.metadata.title,
      description: messages.metadata.description,
      images: [
        {
          url: NJ_LOGO_IMAGE_PATH,
          width: 144,
          height: 144,
          alt: "State of New Jersey logo",
        },
      ],
    },
    twitter: {
      card: "summary",
      title: messages.metadata.title,
      description: messages.metadata.description,
      images: [NJ_LOGO_IMAGE_PATH],
    },
  };
};

/**
 * Renders the locale root layout with `next-intl` and NJWDS script support.
 *
 * @param props Layout props from Next.js.
 * @param props.children Route content for the locale.
 * @param props.params Async route params that include locale.
 * @returns The locale HTML shell and page body.
 * @throws Error from `notFound()` when the locale segment is unsupported.
 * @example
 * ```tsx
 * <LocaleLayout
 *   params={Promise.resolve({ locale: "en-US" })}
 * >
 *   <main>Example</main>
 * </LocaleLayout>
 * ```
 */
const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const messages = getApplicationMessages({ locale });

  return (
    <html dir={textDirectionForLocale(locale)} lang={locale}>
      <head>
        <link href={NJWDS_STYLESHEET_PATH} rel="stylesheet" />
        <link href={NJ_RTL_UTILITIES_STYLESHEET_PATH} rel="stylesheet" />
      </head>
      <body>
        <GoogleTagManager />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <SkipNav
            label={messages.layout.skipNavigationLabel}
            mainContentId={messages.layout.mainContentId}
          />
          <GovBanner content={messages.layout.banner} />
          <SiteHeader
            content={messages.layout.header}
            languageSwitcher={messages.layout.languageSwitcher}
          />
          <main id={messages.layout.mainContentId}>{children}</main>
          <SiteFooter
            content={messages.layout.footer}
            mainContentId={messages.layout.mainContentId}
          />
          <IdentifierSection content={messages.layout.identifier} />
          <LanguagePromptModal />
        </NextIntlClientProvider>
        <Intercom />
      </body>
    </html>
  );
};

/**
 * Exports the locale layout for Next.js app routing.
 */
export default LocaleLayout;
