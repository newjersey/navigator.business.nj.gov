/**
 * Lists routes exempt from `routeMetadata.test.ts`'s descriptive-title check.
 *
 * Every entry here is a route that is not a real, indexable page. Keep this
 * list shrinking, not growing.
 */

/**
 * Maps a route id (its `page.tsx` path relative to `app/`, with route-group
 * segments stripped) to the reason it does not need its own descriptive
 * title.
 */
export const ROUTES_WITHOUT_OWN_TITLE: Readonly<Record<string, string>> = {
  "[locale]": "Home page; correctly inherits the brand-led layout title by design.",
  "[locale]/[...rest]": "Unconditionally calls notFound(); never renders a title.",
  "[locale]/language-switcher-harness": "Dev/test-only harness, gated out of production builds.",
  "[locale]/support": 'Placeholder page with a literal "PLACEHOLDER" h1, not linked from the site.',
};
