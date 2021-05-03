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

export const ALL_LEGAL_STRUCTURES_ORDERED: LegalStructure[] = [
  "limited-liability-company",
  "s-corporation",
  "sole-proprietorship",
  "general-partnership",
  "c-corporation",
  "b-corporation",
  "limited-partnership",
  "limited-liability-partnership",
];
