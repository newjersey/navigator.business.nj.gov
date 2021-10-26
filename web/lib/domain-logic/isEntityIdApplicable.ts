import { TradeNameGroup, LegalStructure } from "@/lib/types/types";

export const isEntityIdApplicable = (legalStructure: LegalStructure | undefined): boolean =>
  legalStructure ? !TradeNameGroup.includes(legalStructure) : false;
