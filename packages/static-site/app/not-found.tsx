/**
 * Fallback 404 for requests that never reach the `[locale]` segment (paths
 * excluded by the middleware matcher in `proxy.ts`). Every other unmatched
 * route is handled by the branded, translated `app/[locale]/not-found.tsx`.
 *
 * No locale is available in this context, so this renders hardcoded English
 * without site chrome, per next-intl's documented pattern for this case:
 * https://next-intl.dev/docs/environments/error-files
 */
const NotFound = () => {
  return (
    <html lang="en">
      <body>
        <h1>404 - Page Not Found</h1>
      </body>
    </html>
  );
};

export default NotFound;
