export interface LegalStructure {
  readonly id: string;
  readonly name: string;
  readonly requiresPublicFiling: boolean;
  readonly hasTradeName: boolean;
  readonly onboardingOrder: number;
}

export const LookupLegalStructureById = (id: string | undefined): LegalStructure => {
  return (
    LegalStructures.find((x) => x.id === id) ?? {
      id: "",
      name: "",
      requiresPublicFiling: false,
      hasTradeName: false,
      onboardingOrder: 0,
    }
  );
};

export const LegalStructures: readonly LegalStructure[] = [
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 30,
  },
  {
    id: "general-partnership",
    name: "General Partnership",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 20,
  },
  {
    id: "limited-partnership",
    name: "Limited Partnership (LP)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 70,
  },
  {
    id: "limited-liability-partnership",
    name: "Limited Liability Partnership (LLP)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 60,
  },
  {
    id: "limited-liability-company",
    name: "Limited Liability Company (LLC)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 10,
  },
  {
    id: "c-corporation",
    name: "Corporation",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 40,
  },
  {
    id: "s-corporation",
    name: "Corporation (and optional S Corp tax designation)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 50,
  },
];
