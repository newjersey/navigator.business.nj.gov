/**
 * Content-Security-Policy builder for the `web` Pages Router app.
 *
 * This is a static, allowlist-based policy applied via `next.config.ts`
 * `headers()`. It is not a nonce-based "strict CSP": the app renders many
 * statically-generated pages, uses MUI/Emotion runtime styles, and has
 * inline `<script>` tags (GTM bootstrap) that are not currently nonced.
 * Moving to nonces would require request-time rendering for every page and
 * a nonce-aware Emotion cache; that is tracked as separate follow-up work.
 *
 * Source allowlists below are derived from vendor documentation, not
 * guesswork:
 * - Intercom (US region only): https://www.intercom.com/help/en/articles/3894-using-intercom-with-content-security-policy
 * - Google Tag Manager / Analytics: https://developers.google.com/tag-platform/security/guides/csp
 * - Next.js CSP guide: https://nextjs.org/docs/pages/guides/content-security-policy
 *
 * If the GTM container is later configured with Google Ads, Floodlight, or
 * other advertising tags, additional origins documented in the Google guide
 * above will need to be added.
 */

export type CspMode = "disabled" | "report-only" | "enforce";

const CSP_MODES: readonly CspMode[] = ["disabled", "report-only", "enforce"];

/**
 * Validates and normalizes the CSP_MODE build variable. Defaults to
 * "disabled" so that omitting the variable never accidentally enforces a
 * policy against production traffic.
 */
export function parseCspMode(rawValue: string | undefined): CspMode {
  if (!rawValue) {
    return "disabled";
  }

  if ((CSP_MODES as readonly string[]).includes(rawValue)) {
    return rawValue as CspMode;
  }

  throw new Error(`Invalid CSP_MODE "${rawValue}". Expected one of: ${CSP_MODES.join(", ")}.`);
}

export interface BuildCspOptions {
  readonly awsRegion?: string;
  readonly apiBaseUrl?: string;
  readonly authDomain?: string;
  readonly outageAlertConfigUrl?: string;
  readonly isDevelopment?: boolean;
}

const GTM_ORIGIN = "https://www.googletagmanager.com";
const GOOGLE_ANALYTICS_SOURCES = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
];

// US-region Intercom endpoints only. If the workspace becomes multi-region,
// add the corresponding *.eu./*.au. hosts documented in Intercom's CSP guide.
const INTERCOM_SCRIPT_SOURCES = ["https://widget.intercom.io", "https://js.intercomcdn.com"];
const INTERCOM_CONNECT_SOURCES = [
  "https://api-iam.intercom.io",
  "https://api-ping.intercom.io",
  "https://nexus-websocket-a.intercom.io",
  "wss://nexus-websocket-a.intercom.io",
  "https://uploads.intercomcdn.com",
  "https://uploads.intercomusercontent.com",
];
const INTERCOM_IMG_SOURCES = [
  "https://js.intercomcdn.com",
  "https://static.intercomassets.com",
  "https://downloads.intercomcdn.com",
  "https://uploads.intercomusercontent.com",
];
const INTERCOM_FONT_SOURCES = ["https://js.intercomcdn.com", "https://fonts.intercomcdn.com"];
const INTERCOM_MEDIA_SOURCES = ["https://js.intercomcdn.com", "https://downloads.intercomcdn.com"];
const INTERCOM_FORM_ACTION_SOURCES = ["https://intercom.help", "https://api-iam.intercom.io"];

function originOf(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function dedupe(values: readonly (string | undefined)[]): string[] {
  return [...new Set(values.filter(Boolean))] as string[];
}

function serializeDirectives(directives: Readonly<Record<string, readonly string[]>>): string {
  return Object.entries(directives)
    .map(([directive, values]) =>
      values.length > 0 ? `${directive} ${values.join(" ")}` : directive,
    )
    .join("; ");
}

/**
 * Builds the Content-Security-Policy applied to application pages.
 *
 * `style-src 'unsafe-inline'` and `script-src 'unsafe-inline'` remain
 * necessary until MUI/Emotion runs with a nonce-aware cache and the GTM
 * inline bootstrap script is converted to a nonced script. See
 * `web/src/pages/_app.tsx` and `web/src/pages/_document.tsx`.
 */
export function buildContentSecurityPolicy(options: BuildCspOptions): string {
  const cognitoIdpOrigin = options.awsRegion
    ? `https://cognito-idp.${options.awsRegion}.amazonaws.com`
    : undefined;
  const cognitoIdentityOrigin = options.awsRegion
    ? `https://cognito-identity.${options.awsRegion}.amazonaws.com`
    : undefined;

  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": dedupe(["'self'", "'unsafe-inline'", GTM_ORIGIN, ...INTERCOM_SCRIPT_SOURCES]),
    "style-src": ["'self'", "'unsafe-inline'"],
    "connect-src": dedupe([
      "'self'",
      originOf(options.apiBaseUrl),
      originOf(options.authDomain),
      cognitoIdpOrigin,
      cognitoIdentityOrigin,
      originOf(options.outageAlertConfigUrl),
      GTM_ORIGIN,
      ...GOOGLE_ANALYTICS_SOURCES,
      ...INTERCOM_CONNECT_SOURCES,
    ]),
    "img-src": dedupe([
      "'self'",
      "data:",
      "blob:",
      GTM_ORIGIN,
      ...GOOGLE_ANALYTICS_SOURCES,
      ...INTERCOM_IMG_SOURCES,
    ]),
    "font-src": dedupe(["'self'", "data:", "https://fonts.gstatic.com", ...INTERCOM_FONT_SOURCES]),
    "media-src": dedupe(["'self'", ...INTERCOM_MEDIA_SOURCES]),
    "frame-src": [GTM_ORIGIN],
    "worker-src": ["'self'", "blob:"],
    "form-action": dedupe(["'self'", ...INTERCOM_FORM_ACTION_SOURCES]),
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "frame-ancestors": ["'none'"],
  };

  const serialized = serializeDirectives(directives);

  return options.isDevelopment ? serialized : `${serialized}; upgrade-insecure-requests`;
}

// Static, hardcoded per web/decap-config/config-base.yml — the CMS OAuth
// gateway and preview logo are not environment-specific build variables.
const CMS_OAUTH_ORIGIN = "https://o5snnsoroh.execute-api.us-east-1.amazonaws.com";
const CMS_LOGO_ORIGIN = "https://dev.navigator.business.nj.gov";

/**
 * Builds the Content-Security-Policy for the `/mgmt/cms` Decap CMS route.
 * This route is admin-only, so it receives a wider allowlist for GitHub's
 * API/OAuth and raw content endpoints rather than expanding the
 * application-wide policy. Validate against the deployed CMS in report-only
 * mode before enforcing: Decap's exact runtime requirements were not
 * independently verified against vendor documentation.
 */
export function buildCmsContentSecurityPolicy(options: BuildCspOptions): string {
  const basePolicy = buildContentSecurityPolicy(options);

  const additions: Record<string, string[]> = {
    "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    "connect-src": ["'self'", CMS_OAUTH_ORIGIN, "https://api.github.com", "https://github.com"],
    "img-src": [
      "'self'",
      "data:",
      "blob:",
      CMS_LOGO_ORIGIN,
      "https://avatars.githubusercontent.com",
      "https://raw.githubusercontent.com",
    ],
    "form-action": ["'self'", "https://github.com"],
  };

  return mergeDirectives(basePolicy, additions);
}

function mergeDirectives(
  basePolicy: string,
  additions: Readonly<Record<string, readonly string[]>>,
): string {
  const merged = new Map<string, string[]>();

  for (const clause of basePolicy.split(";")) {
    const trimmed = clause.trim();
    if (!trimmed) {
      continue;
    }
    const [directive, ...values] = trimmed.split(" ");
    merged.set(directive, values);
  }

  for (const [directive, values] of Object.entries(additions)) {
    const existing = merged.get(directive) ?? [];
    merged.set(directive, dedupe([...existing, ...values]));
  }

  return serializeDirectives(Object.fromEntries(merged));
}
