/**
 * Defines locale middleware and route matchers for Next.js requests.
 *
 * This module applies `next-intl` middleware to page routes while skipping
 * assets and API paths.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";

import { routing } from "@/domain/i18n/routing";
import { type BasicAuthCredentials, isBasicAuthAuthorized } from "@/proxyAuth";

/**
 * Authentication realm shown by browsers when a protected deployment asks for static-site
 * credentials.
 */
const BASIC_AUTH_REALM = "Business.NJ.gov";

/**
 * Creates locale middleware for page requests.
 */
const localeProxy = createMiddleware(routing);

/**
 * Reads runtime environment values supplied by ECS.
 */
const getRuntimeEnvironmentValue = (name: string): string | undefined => {
  // biome-ignore lint/style/noProcessEnv: ECS injects Basic Auth deployment settings at runtime.
  return process.env[name];
};

/**
 * Indicates whether Basic Auth should guard the current deployment.
 */
const isBasicAuthEnabled = (): boolean => {
  return getRuntimeEnvironmentValue("USE_BASIC_AUTH") === "true";
};

/**
 * Reads configured Basic Auth credentials for the current deployment.
 */
const getBasicAuthCredentials = (): BasicAuthCredentials | undefined => {
  const username = getRuntimeEnvironmentValue("BASIC_AUTH_USERNAME");
  const password = getRuntimeEnvironmentValue("BASIC_AUTH_PASSWORD");

  if (!username || !password) {
    return undefined;
  }

  return { username, password };
};

/**
 * Creates the browser challenge response for missing or invalid Basic Auth credentials.
 */
const createUnauthorizedResponse = (): NextResponse => {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}"`,
    },
  });
};

/**
 * Applies Basic Auth for protected deployments before locale routing.
 */
const proxy = (request: NextRequest): NextResponse => {
  if (!isBasicAuthEnabled()) {
    return localeProxy(request);
  }

  const credentials = getBasicAuthCredentials();

  if (!credentials) {
    return createUnauthorizedResponse();
  }

  const isAuthorized = isBasicAuthAuthorized({
    authorizationHeader: request.headers.get("authorization"),
    credentials,
  });

  if (!isAuthorized) {
    return createUnauthorizedResponse();
  }

  return localeProxy(request);
};

/**
 * Exports the locale middleware for Next.js route handling.
 */
export default proxy;

/**
 * Declares which routes should pass through locale middleware.
 *
 * The matcher excludes API routes, health checks, framework assets, and file requests.
 */
export const config = {
  matcher: ["/((?!api|healthz|_next|_vercel|.*\\..*).*)"],
};
