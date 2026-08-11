export const webBuildEnvironmentVariableNames = [
  "ALTERNATE_LANDING_PAGE_URL",
  "API_BASE_URL",
  "AUTH_DOMAIN",
  "AWS_REGION",
  "BASIC_AUTH_AGENCY_PASSWORD",
  "BASIC_AUTH_AGENCY_USERNAME",
  "BASIC_AUTH_PASSWORD",
  "BASIC_AUTH_USERNAME",
  "CHECK_DEAD_LINKS",
  "COGNITO_IDENTITY_POOL_ID",
  "COGNITO_USER_POOL_ID",
  "COGNITO_WEB_CLIENT_ID",
  "DEV_ONLY_UNLINK_TAX_ID",
  "DISABLE_GTM",
  "FEATURE_BUSINESS_FLP",
  "FEATURE_CIGARETTE_LICENSE",
  "FEATURE_EMPLOYER_RATES",
  "FEATURE_FORMATION_SURVEY",
  "FEATURE_LANDING_PAGE_REDIRECT",
  "FEATURE_LOGIN_PAGE",
  "FEATURE_MODIFY_BUSINESS_PAGE",
  "FEATURE_NAICS_INDUSTRY_DETECTION",
  "FEATURE_TAX_CLEARANCE_CERTIFICATE",
  "GOOGLE_TAG_MANAGER_ID",
  "MYNJ_PROFILE_LINK",
  "NEXT_PUBLIC_WEB_BASE_URL",
  "OUTAGE_ALERT_CONFIG_URL",
  "REDIRECT_URL",
  "SHOW_DISABLED_INDUSTRIES",
  "STAGE",
  "USE_BASIC_AUTH",
  "USE_WIREMOCK_FOR_FORMATION_AND_BUSINESS_SEARCH",
] as const;

interface BuildEnvironment {
  readonly [name: string]: string | undefined;
}

const UNSUPPORTED_DOTENV_CHARACTERS = /["\\]/;

export const serializeWebBuildEnvironment = (environment: BuildEnvironment): string => {
  return webBuildEnvironmentVariableNames
    .flatMap((name) => {
      const value = environment[name];
      return value === undefined ? [] : [`${name}="${encodeDotenvValue(name, value)}"\n`];
    })
    .join("");
};

// Next's build-time dotenv loader (`@next/env`) only unescapes literal "\r"/"\n" text sequences
// inside a double-quoted value, and its dotenv-expand step interpolates any unescaped
// "$name"/"${name}" sequence against other environment variables. It does not unescape "\\\"" or
// "\\\\" back to a literal quote or backslash. Escaping "\r", "\n", and "$" here, and rejecting
// values that contain a literal quote or backslash outright, keeps the value Next parses back out
// byte-for-byte identical to the original instead of silently corrupting or interpolating it.
const encodeDotenvValue = (name: string, value: string): string => {
  if (UNSUPPORTED_DOTENV_CHARACTERS.test(value)) {
    throw new Error(
      `${name} contains a double quote or backslash character, which Next's dotenv loader ` +
        "cannot represent inside a double-quoted value without corrupting it on read. Rotate " +
        "the value to remove that character.",
    );
  }

  return value.replaceAll("\r", "\\r").replaceAll("\n", "\\n").replaceAll("$", "\\$");
};
