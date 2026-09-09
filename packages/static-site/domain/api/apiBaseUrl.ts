/**
 * Origin of the Navigator API, used for client-side calls from the static site.
 *
 * The value comes from the `API_BASE_URL_AWS_*` repo variables, which are
 * authored per environment and are also consumed by the API's own deploys. A
 * trailing slash in any of them would otherwise produce a double slash once a
 * caller appends an absolute path, so normalize it here rather than at each
 * call site.
 */

/**
 * Reads the API origin for this build with a trailing slash removed.
 *
 * @returns The configured origin, or an empty string when unset. An empty
 *   origin yields a same-origin request that fails rather than reaching the
 *   API, so callers must treat it as a misconfigured environment.
 */
export const getApiBaseUrl = (): string => {
  // biome-ignore lint/style/noProcessEnv: NEXT_PUBLIC_ vars are inlined at build time.
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  return configuredBaseUrl.trim().replace(/\/$/, "");
};
