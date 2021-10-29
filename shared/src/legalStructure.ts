export interface LegalStructure {
  id: string;
  name: string;
  requiresPublicFiling: boolean;
  hasTradeName: boolean;
}

export const LookupLegalStructureById = (id: string | undefined): LegalStructure => {
  return (
    LegalStructures.find((x) => x.id === id) ?? {
      id: "",
      name: "",
      requiresPublicFiling: false,
      hasTradeName: false,
    }
  );
};

export const LegalStructures: LegalStructure[] = [
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship",
    requiresPublicFiling: false,
    hasTradeName: true,
  },
  {
    id: "general-partnership",
    name: "General Partnership",
    requiresPublicFiling: false,
    hasTradeName: true,
  },
  {
    id: "limited-partnership",
    name: "Limited Partnership (LP)",
    requiresPublicFiling: true,
    hasTradeName: false,
  },
  {
    id: "limited-liability-partnership",
    name: "Limited Liability Partnership (LLP)",
    requiresPublicFiling: true,
    hasTradeName: false,
  },
  {
    id: "limited-liability-company",
    name: "Limited Liability Company (LLC)",
    requiresPublicFiling: true,
    hasTradeName: false,
  },
  {
    id: "c-corporation",
    name: "C-Corporation",
    requiresPublicFiling: true,
    hasTradeName: false,
  },
];
