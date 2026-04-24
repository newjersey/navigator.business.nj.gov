/**
 * Defines locale middleware and route matchers for Next.js requests.
 *
 * This module applies `next-intl` middleware to page routes while skipping
 * assets and API paths.
 */

import createMiddleware from "next-intl/middleware";

import { routing } from "@/domain/i18n/routing";

/**
 * Creates locale middleware for page requests.
 *
 * This module wires `next-intl` middleware into the app so locale-prefixed
 * routes resolve correctly.
 */
const proxy = createMiddleware(routing);

/**
 * Exports the locale middleware for Next.js route handling.
 */
export default proxy;

/**
 * Declares which routes should pass through locale middleware.
 *
 * The matcher excludes API routes, framework assets, and file requests.
 */
export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
