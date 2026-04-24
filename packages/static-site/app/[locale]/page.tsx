/**
 * Implements the locale-scoped landing page route.
 *
 * This route validates the locale segment, loads localized landing content,
 * and renders the composed landing page component.
 */

import { notFound } from "next/navigation";

import { LandingPage } from "@/components/landing/LandingPage";
import { hasAppLocale } from "@/domain/i18n/locales";
import { loadLandingContentFromMessages } from "@/domain/landing/loadLandingContent";

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

  const loadedLandingContent = await loadLandingContentFromMessages({ locale });

  return <LandingPage content={loadedLandingContent.landing} />;
};

/**
 * Exports the locale page route component for Next.js.
 *
 * Keep this as a default export so the route can be discovered by the app
 * router.
 */
export default LocalizedLandingPage;
