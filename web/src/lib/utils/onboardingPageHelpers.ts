import { OnboardingFlow } from "@/components/onboarding/OnboardingFlows";
import { Business, LookupIndustryById, LookupSectorTypeById } from "@businessnjgovnavigator/shared";
import { FlowType, Page } from "@businessnjgovnavigator/shared/types";
import { QUERY_PARAMS_VALUES } from "../domain-logic/routes";
import { getFlow } from "./helpers";

export const mapFlowQueryToPersona: Record<QUERY_PARAMS_VALUES["flow"], FlowType> = {
  starting: "STARTING",
  "out-of-state": "FOREIGN",
  "up-and-running": "OWNING",
};

export const industryQueryParamIsValid = (industryId: string | undefined): boolean => {
  return !!LookupIndustryById(industryId).id;
};

export const sectorQueryParamIsValid = (sectorId: string): boolean => {
  return !!LookupSectorTypeById(sectorId).id;
};

export const flowQueryParamIsValid = (flow: string): boolean => {
  return Object.keys(mapFlowQueryToPersona).includes(flow);
};

export const pageQueryParamIsValid = (
  onboardingFlows: Record<FlowType, OnboardingFlow>,
  business: Business,
  page: number,
): boolean => {
  const hasAnsweredBusinessPersona = business?.profileData.businessPersona !== undefined;
  const flow = getFlow(business.profileData);
  const requestedPageIsInRange = page <= onboardingFlows[flow].pages.length && page > 0;

  return hasAnsweredBusinessPersona && requestedPageIsInRange;
};

export const getAnimation = (page: Page): string => {
  return page.previous < page.current ? "slide" : "slide-back";
};

export const getTimeout = (page: Page, slidePage: number): number => {
  return slidePage === page.previous ? 100 : 300;
};
