import { LegalStructure } from "../lib/types/types";

export const LegalStructureLookup: Record<LegalStructure, string> = {
  "sole-proprietorship": "Sole Proprietorship",
  "general-partnership": "General Partnership",
  "limited-partnership": "Limited Partnership (LP)",
  "limited-liability-partnership": "Limited Liability Partnership (LLP)",
  "limited-liability-company": "Limited Liability Company (LLC)",
  "c-corporation": "C-Corporation",
  "s-corporation": "S-Corporation",
  "b-corporation": "B-Corporation",
};
