import { notFound } from "next/navigation";

/**
 * Catches every otherwise-unmatched path under a `[locale]` prefix.
 *
 * Without this, Next.js never matches (and therefore never renders) a route
 * component for an unknown deep path, so `notFound()` is never called from
 * within the locale segment and the request falls through to the untranslated
 * root `not-found.tsx` instead of the branded `[locale]/not-found.tsx`.
 * https://next-intl.dev/docs/environments/error-files
 */
const CatchAllPage = () => {
  notFound();
};

export default CatchAllPage;
