import { OnboardingFlow } from "@/components/onboarding/OnboardingFlows";
import Config from "@businessnjgovnavigator/content/fieldConfig/config.json";
import { LookupIndustryById } from "@businessnjgovnavigator/shared/industry";
import { Business } from "@businessnjgovnavigator/shared/userData";
import { QUERY_PARAMS_VALUES } from "../domain-logic/routes";
import { FlowType, Page } from "../types/types";
import { getFlow, templateEval } from "./helpers";

export const mapFlowQueryToPersona: Record<QUERY_PARAMS_VALUES["flow"], FlowType> = {
  starting: "STARTING",
  "out-of-state": "FOREIGN",
  "up-and-running": "OWNING"
};

export const industryQueryParamIsValid = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).id;
};

export const flowQueryParamIsValid = (flow: string): boolean => {
  return Object.keys(mapFlowQueryToPersona).includes(flow);
};

export const pageQueryParamisValid = (
  onboardingFlows: Record<FlowType, OnboardingFlow>,
  business: Business,
  page: number
): boolean => {
  const hasAnsweredBusinessPersona = business?.profileData.businessPersona !== undefined;
  const flow = getFlow(business.profileData);
  const requestedPageIsInRange = page <= onboardingFlows[flow].pages.length && page > 0;

  return hasAnsweredBusinessPersona && requestedPageIsInRange;
};

export const evalHeaderStepsTemplate = (page: Page): string => {
  return templateEval(Config.onboardingDefaults.stepXTemplate, {
    currentPage: page.current.toString()
  });
};

export const getAnimation = (page: Page): string => {
  return page.previous < page.current ? "slide" : "slide-back";
};

export const getTimeout = (page: Page, slidePage: number): number => {
  return slidePage === page.previous ? 100 : 300;
};
