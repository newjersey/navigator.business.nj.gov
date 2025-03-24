import { NextRouter } from "next/router";

export const ROUTES = {
  landing: "/",
  loading: "/loading",
  profile: "/profile",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  unsupported: "/unsupported",
  anytimeActions: "/actions",
  licenseReinstatement: "/license-reinstatement",
  welcome: "/welcome",
  accountSetup: "/account-setup",
  starterKits: "/starter-kits",
  login: "/login",
  unlinkedAccount: "/unlinked-account",
  njeda: "/njeda",
  cigaretteLicense: "/tasks/cigarette-license",
  taxClearanceCertificate: "/actions/tax-clearance-certificate-apply",
  envPermit: "tasks/env-permitting",
};

export interface QUERY_PARAMS_VALUES {
  page: number;
  deferredQuestionAnswered: "true" | "false";
  fromFormBusinessEntity: "true" | "false";
  fromForming: "true";
  fromAdditionalBusiness: "true";
  fromDeleteBusiness: "true";
  fromFunding: "true";
  fromOnboarding: "true";
  completeFiling: "true" | "false";
  completePayment: "success" | "failure" | "duplicate" | "cancel";
  success: "true";
  additionalBusiness: "true";
  path: "businessFormation";
  signUp: "true";
  industry: string;
  code: string;
  flow: "starting" | "out-of-state" | "up-and-running";
  source: "guest_snackbar";
}

export enum QUERIES {
  additionalBusiness = "additionalBusiness",
  businessMunicipality = "businessMunicipality",
  code = "code",
  completeFiling = "completeFiling",
  completePayment = "completePayment",
  deferredQuestionAnswered = "deferredQuestionAnswered",
  flow = "flow",
  fromAdditionalBusiness = "fromAdditionalBusiness",
  fromDeleteBusiness = "fromDeleteBusiness",
  fromFormBusinessEntity = "fromFormBusinessEntity",
  fromForming = "fromForming",
  fromFunding = "fromFunding",
  fromOnboarding = "fromOnboarding",
  industry = "industry",
  page = "page",
  path = "path",
  previousBusinessId = "previousBusinessId",
  sector = "sector",
  signUp = "signUp",
  source = "source",
  success = "success",
  tab = "tab",
  utmSource = "utm_source",
}

export const routeShallowWithQuery = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  query: K,
  value: QUERY_PARAMS_VALUES[K],
): void => {
  router.push({ query: { [query]: value } }, undefined, { shallow: true });
};

export const routeWithQuery = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  config: {
    path: string;
    queries: Record<K, QUERY_PARAMS_VALUES[K]>;
  },
): void => {
  router.push({
    pathname: config.path,
    query: config.queries,
  });
};

export const checkQueryValue = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  query: K,
  value: QUERY_PARAMS_VALUES[K],
): boolean => {
  return router.query[query] === value;
};
