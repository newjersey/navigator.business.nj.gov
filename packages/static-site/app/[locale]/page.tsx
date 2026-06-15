/**
 * Implements the locale-scoped landing page route.
 *
 * This route validates the locale segment, loads localized landing content,
 * and renders the landing page component.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Script from "next/script";

import { BroughtToYouBySection } from "@/components/landing/BroughtToYouBySection";
import { CtaBannerSection } from "@/components/landing/CtaBannerSection";
import { FeedbackBar } from "@/components/landing/FeedbackBar";
import { HeroSection } from "@/components/landing/HeroSection";
import { QuickServicesSection } from "@/components/landing/QuickServicesSection";
import { SupportSection } from "@/components/landing/SupportSection";
import { WhatsNewSection } from "@/components/landing/WhatsNewSection";
import { loadRecents } from "@/domain/content/loadContent";
import { buildAlternateLanguages } from "@/domain/i18n/alternateLanguages";
import { hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

/**
 * Describes route params for locale page rendering.
 *
 * This type defines a stable shape for related data.
 */
interface LocalePageParams {
  /** Locale segment captured from the route. */
  readonly locale: string;
}

/**
 * Describes props accepted by the locale page route component.
 *
 * This type defines a stable shape for related data.
 */
interface LocalizedPageProps {
  /** Asynchronous route parameters provided by Next.js. */
  readonly params: Promise<LocalePageParams>;
}

/**
 * Generates metadata advertising hreflang alternates for the landing page.
 *
 * @returns Metadata containing canonical and alternate-language links.
 * @example
 * ```ts
 * const metadata = generateMetadata();
 * ```
 */
export const generateMetadata = (): Metadata => {
  return { alternates: buildAlternateLanguages({ pathnameWithoutLocale: "/" }) };
};

/**
 * Renders the localized landing page route.
 *
 * @param props Route props provided by Next.js.
 * @param props.params Async locale route params.
 * @returns The localized landing page markup.
 * @throws Error from `notFound()` when the locale segment is unsupported.
 * @example
 * ```tsx
 * <LocalizedLandingPage params={Promise.resolve({ locale: "en-US" })} />
 * ```
 */
const LocalizedLandingPage = async ({ params }: LocalizedPageProps) => {
  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const messages = await getApplicationMessages({ locale });
  const allRecents = loadRecents();

  const recents = allRecents
    .filter((r) => r.date)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, 3);

  return (
    <>
      <HeroSection content={messages.landing.hero} />
      <QuickServicesSection content={messages.landing.quickServices} />
      <CtaBannerSection content={messages.landing.ctaBanner} />
      <WhatsNewSection content={messages.landing.whatsNew} recents={recents} />
      <SupportSection content={messages.landing.support} />
      <BroughtToYouBySection content={messages.landing.broughtToYouBy} />
      <FeedbackBar content={messages.landing.feedbackBar} />
      {
        // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
        process.env.NEXT_PUBLIC_SURVEY_MONKEY_ENABLED === "true" && (
          <Script
            id="smcx-sdk"
            src="https://widget.surveymonkey.com/collect/website/js/tRaiETqnLgj758hTBazgd_2Fl0hAvWCD8cNdKnWc8kt0IafoTskhMiZ5h9m_2FJavuow.js"
            strategy="afterInteractive"
          />
        )
      }
    </>
  );
};

/**
 * Exports the locale page route component for Next.js.
 *
 * Keep this as a default export so the route can be discovered by the app
 * router.
 */
export default LocalizedLandingPage;
