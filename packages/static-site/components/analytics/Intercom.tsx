/**
 * Loads the Intercom messenger on every page of the static site.
 *
 * This module defines the `window.intercomSettings` configuration and injects
 * the Intercom widget loader, which attaches the messenger once the page has
 * loaded.
 */

import Script from "next/script";

/**
 * Intercom workspace (app) ID for the static site.
 *
 * This is a public client-side identifier embedded in delivered HTML, so it
 * lives here as a constant alongside the other site-wide asset references.
 */
const INTERCOM_APP_ID = "ozxx8n5h";

/**
 * Intercom widget ID used to fetch the messenger loader script.
 */
const INTERCOM_WIDGET_ID = "td643jax";

/**
 * CSS selector for elements that should open the Intercom messenger on click.
 */
const INTERCOM_LAUNCHER_SELECTOR = ".intercomlaunch";

/**
 * Renders the Intercom settings and widget loader scripts.
 *
 * The settings script defines `window.intercomSettings` before the loader runs
 * so the messenger boots with the correct workspace and launcher selector. Both
 * scripts use the `afterInteractive` strategy so they do not block first paint.
 *
 * @returns The Intercom settings and loader scripts.
 * @example
 * ```tsx
 * <body>
 *   <Intercom />
 * </body>
 * ```
 */
export const Intercom = () => {
  return (
    <>
      <Script id="intercom-settings" strategy="afterInteractive">
        {`window.intercomSettings = {
  app_id: "${INTERCOM_APP_ID}",
  custom_launcher_selector: "${INTERCOM_LAUNCHER_SELECTOR}"
};`}
      </Script>
      <Script id="intercom-widget" strategy="afterInteractive">
        {`(function(){var w=window;var ic=w.Intercom;if(typeof ic==="function"){ic('reattach_activator');ic('update',w.intercomSettings);}else{var d=document;var i=function(){i.c(arguments);};i.q=[];i.c=function(args){i.q.push(args);};w.Intercom=i;var l=function(){var s=d.createElement('script');s.type='text/javascript';s.async=true;s.src='https://widget.intercom.io/widget/${INTERCOM_WIDGET_ID}';var x=d.getElementsByTagName('script')[0];x.parentNode.insertBefore(s,x);};if(w.attachEvent){w.attachEvent('onload',l);}else{w.addEventListener('load',l,false);}}})();`}
      </Script>
    </>
  );
};
