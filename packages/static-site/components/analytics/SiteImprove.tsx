/**
 * Loads Siteimprove analytics on every page of the static site.
 *
 * This module injects the Siteimprove tracker script used for analytics and
 * accessibility monitoring.
 */

import Script from "next/script";

/**
 * Siteimprove tracker URL for the static site.
 *
 * This is a public client-side asset reference embedded in delivered HTML, so
 * it lives here as a constant alongside the other site-wide asset references.
 */
const SITEIMPROVE_SCRIPT_SRC = "https://siteimproveanalytics.com/js/siteanalyze_6291948.js";

/**
 * Renders the Siteimprove tracker loader.
 *
 * The script runs with the `afterInteractive` strategy so the tracker loads
 * as soon as the page is interactive without blocking first paint.
 *
 * @returns The Siteimprove tracker script.
 * @example
 * ```tsx
 * <body>
 *   <Siteimprove />
 * </body>
 * ```
 */
export const SiteImprove = () => {
  return (
    <Script id="siteimprove-analytics" src={SITEIMPROVE_SCRIPT_SRC} strategy="afterInteractive" />
  );
};
