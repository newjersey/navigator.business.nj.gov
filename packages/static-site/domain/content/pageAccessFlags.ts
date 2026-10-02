/**
 * Registry of pages with build-time access gating.
 *
 * Add an entry here to conditionally exclude a page from navigation, the
 * sitemap, legacy redirects, and the route itself. Each page's `isEnabled()`
 * reads a `NEXT_PUBLIC_` env var inlined by Next.js at build time.
 *
 * When adding a new entry:
 * 1. Add slug and pathname constants to `pagePaths.ts`.
 * 2. Add an entry below referencing those constants and an env var check.
 * 3. For pages served by the `/pages/[slug]` route, no route change is needed —
 *    `pages/[slug]/page.tsx` checks `isPageDisabled` automatically.
 *    For pages with a dedicated route (e.g. `/housingprograms`), add an
 *    `if (isPageDisabled(SLUG)) notFound();` guard to that page's `page.tsx`.
 * 4. Thread the env var through `.env-template`, `Dockerfile`, and CI workflows.
 */

export interface PageAccessFlag {
  readonly slug: string;
  readonly pathname: string;
  readonly isEnabled: () => boolean;
}

/**
 * Creates the access-check helpers for a given flag list.
 * Exported so tests can supply their own flag entries without modifying the registry.
 */
export const buildPageAccessHelpers = (flags: readonly PageAccessFlag[]) => ({
  disabledPageSlugs: (): readonly string[] =>
    flags.filter((p) => !p.isEnabled()).map((p) => p.slug),
  disabledPagePathnames: (): readonly string[] =>
    flags.filter((p) => !p.isEnabled()).map((p) => p.pathname),
  isPageDisabled: (slug: string): boolean => flags.some((p) => p.slug === slug && !p.isEnabled()),
});

const PAGE_ACCESS_FLAGS: readonly PageAccessFlag[] = [
  // Add entries here. Example:
  // {
  //   slug: EXAMPLE_SLUG,
  //   pathname: EXAMPLE_PATHNAME,
  //   // biome-ignore lint/style/noProcessEnv: build-time flag read, consistent with locales.ts
  //   isEnabled: () => process.env.NEXT_PUBLIC_EXAMPLE_ENABLED === "true",
  // },
];

export const { disabledPageSlugs, disabledPagePathnames, isPageDisabled } =
  buildPageAccessHelpers(PAGE_ACCESS_FLAGS);
