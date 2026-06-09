/**
 * Loads Google Tag Manager on every page of the static site.
 *
 * This module injects the GTM bootstrap script that initializes the
 * `dataLayer` and asynchronously loads the container, plus the `<noscript>`
 * iframe fallback for clients with JavaScript disabled.
 */

import Script from "next/script";

/**
 * Google Tag Manager container ID for the static site.
 *
 * This is a public client-side identifier embedded in delivered HTML, so it
 * lives here as a constant alongside the other site-wide asset references.
 */
const GTM_CONTAINER_ID = "GTM-MK9ZQD9";

/**
 * Renders the Google Tag Manager loader and `<noscript>` fallback.
 *
 * The inline loader runs with the `afterInteractive` strategy so the container
 * loads as soon as the page is interactive without blocking first paint. The
 * `<noscript>` iframe is rendered directly so it is present for clients that do
 * not execute scripts.
 *
 * @returns The GTM loader script and `<noscript>` iframe fallback.
 * @example
 * ```tsx
 * <body>
 *   <GoogleTagManager />
 * </body>
 * ```
 */
export const GoogleTagManager = () => {
  return (
    <>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`}
      </Script>
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONTAINER_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
};
