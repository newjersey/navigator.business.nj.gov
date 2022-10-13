import { NextRouter } from "next/router";

export const ROUTES = {
  landing: "/",
  loading: "/loading",
  profile: "/profile",
  dashboard: "/dashboard",
  onboarding: "/onboarding",
  unsupported: "/unsupported",
};

interface QUERY_PARAMS_VALUES {
  page: number;
  deferredQuestionAnswered: "true" | "false";
  fromFormBusinessEntity: "true" | "false";
  fromTaxRegistration: "true" | "false";
  fromForming: "true";
  fromFunding: "true";
  fromOnboarding: "true";
  completeFiling: "true";
  success: "true";
  path: "businessFormation";
  signUp: "true";
  industry: any;
  code: any;
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
}

export const routeShallowWithQuery = <K extends keyof QUERY_PARAMS_VALUES>(
  router: NextRouter,
  query: K,
  value: QUERY_PARAMS_VALUES[K]
): void => {
  router.push({ query: { query: value } }, undefined, { shallow: true });
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
