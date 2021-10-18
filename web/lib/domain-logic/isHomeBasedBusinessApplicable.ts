import { LookupIndustryById } from "@/shared/industry";

export const isHomeBasedBusinessApplicable = (industryId: string | undefined): boolean => {
  return LookupIndustryById(industryId)?.canBeHomeBased ?? false;
};
