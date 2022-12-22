import { NextRouter } from "next/router";

export const ROUTES = {
  landing: "/",
  loading: "/loading",
  profile: "/profile",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  unsupported: "/unsupported",
};

export interface QUERY_PARAMS_VALUES {
  page: number;
  deferredQuestionAnswered: "true" | "false";
  fromFormBusinessEntity: "true" | "false";
  fromTaxRegistration: "true" | "false";
  fromForming: "true";
  fromFunding: "true";
  fromOnboarding: "true";
  completeFiling: "true" | "false";
  success: "true";
  path: "businessFormation";
  signUp: "true";
  industry: string;
  code: string;
  openTaxFilingsModal: "true";
  flow: "starting" | "out-of-state" | "up-and-running";
}

export enum QUERIES {
  page = "page",
  deferredQuestionAnswered = "deferredQuestionAnswered",
  fromFormBusinessEntity = "fromFormBusinessEntity",
  fromTaxRegistration = "fromTaxRegistration",
  fromForming = "fromForming",
  fromFunding = "fromFunding",
  fromOnboarding = "fromOnboarding",
  completeFiling = "completeFiling",
  success = "success",
  path = "path",
  signUp = "signUp",
  industry = "industry",
  code = "code",
  openTaxFilingsModal = "openTaxFilingsModal",
  flow = "flow",
}

export const routeShallowWithQuery = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  query: K,
  value: QUERY_PARAMS_VALUES[K]
): void => {
  router.push({ query: { [query]: value } }, undefined, { shallow: true });
};

export const routeWithQuery = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  config: {
    path: string;
    queries: Record<K, QUERY_PARAMS_VALUES[K]>;
  }
): void => {
  router.push({
    pathname: config.path,
    query: config.queries,
  });
};

export const checkQueryValue = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  query: K,
  value: QUERY_PARAMS_VALUES[K]
): boolean => {
  return router.query[query] === value;
};
