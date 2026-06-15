/**
 * Test-only harness that renders the language switcher with a controlled
 * number of options so e2e tests can assert scroll behavior at specific counts.
 *
 * This route is gated out of production builds via `notFound()`, so it never
 * ships to real users. It exists solely to bridge the "inject a specific option
 * count" need with a real browser, where scrollHeight/clientHeight are
 * meaningful (jsdom has no layout engine).
 */

import { notFound } from "next/navigation";

import { LanguageSwitcher } from "@/components/landing/LanguageSwitcher";
import type { LanguageDescriptor } from "@/domain/i18n/languages";
import { type AppLocale, hasAppLocale } from "@/domain/i18n/locales";
import { getApplicationMessages } from "@/domain/i18n/messages";

/** Upper bound on synthetic options, generous enough to exercise scrolling. */
const MAX_SYNTHETIC_OPTIONS = 20;

/**
 * Describes route params and query for the harness page.
 */
interface HarnessPageProps {
  /** Async locale route params provided by Next.js. */
  readonly params: Promise<{ readonly locale: string }>;
  /** Async query params; `count` selects how many languages to render. */
  readonly searchParams: Promise<{ readonly count?: string }>;
}

/**
 * Clamps the requested option count into the supported synthetic range.
 *
 * @param rawCount Raw `count` query value, possibly undefined or invalid.
 * @returns A count between 1 and {@link MAX_SYNTHETIC_OPTIONS}.
 */
const resolveCount = (rawCount: string | undefined): number => {
  const parsed = Number.parseInt(rawCount ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return MAX_SYNTHETIC_OPTIONS;
  }

  return Math.min(parsed, MAX_SYNTHETIC_OPTIONS);
};

/**
 * Builds a list of synthetic language descriptors for scroll measurement.
 *
 * The switcher is stateless, so its scroll behavior depends only on how many
 * options it renders, not on the app's real language set. Generating options
 * here keeps the scroll e2e tests independent of the supported locales. The
 * synthetic `locale` values are display-only (the harness never navigates), so
 * they are cast to {@link AppLocale} to satisfy the descriptor type.
 *
 * @param count How many synthetic options to produce.
 * @returns A descriptor list of the requested length.
 */
const buildSyntheticDescriptors = (count: number): readonly LanguageDescriptor[] => {
  return Array.from({ length: count }, (_unused, index) => {
    return {
      locale: `synthetic-${index}` as AppLocale,
      nativeName: `Language ${index + 1}`,
      englishName: `Language ${index + 1}`,
      regionName: "United States",
      textDirection: "ltr",
    } satisfies LanguageDescriptor;
  });
};

/**
 * Renders the language switcher with a controlled number of options.
 *
 * @param props Route props with locale params and `count` query.
 * @returns The harness markup, or `notFound()` in production / for bad locales.
 */
const LanguageSwitcherHarnessPage = async ({ params, searchParams }: HarnessPageProps) => {
  // biome-ignore lint/style/noProcessEnv: gate this test-only route out of production builds.
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  const { locale } = await params;

  if (!hasAppLocale(locale)) {
    notFound();
  }

  const { count } = await searchParams;
  const descriptors = buildSyntheticDescriptors(resolveCount(count));
  const messages = getApplicationMessages({ locale });

  return (
    <div className="grid-container usa-section">
      <h1>Language switcher harness</h1>
      <LanguageSwitcher
        buttonLabel={messages.layout.languageSwitcher.buttonLabel}
        currentLanguageLabel={messages.layout.languageSwitcher.currentLanguageLabel}
        currentLocale={locale}
        descriptors={descriptors}
        navigationAriaLabel={messages.layout.languageSwitcher.navigationAriaLabel}
        pathname="/language-switcher-harness"
        submenuId="harness-language-switcher-submenu"
      />
    </div>
  );
};

export default LanguageSwitcherHarnessPage;
