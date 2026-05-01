export interface LegalStructure {
  readonly id: string;
  readonly name: string;
  readonly abbreviation: string;
  readonly requiresPublicFiling: boolean;
  readonly hasTradeName: boolean;
  readonly isCommon: boolean;
  readonly onboardingOrder: number;
  readonly elementsToDisplay: Set<ElementsToDisplay>;
}
type ElementsToDisplay =
  | "taxIdDisclaimer"
  | "entityId"
  | "responsibleOwnerName"
  | "tradeName"
  | "businessName"
  | "nexusBusinessElements"
  | "dbaName"
  | "formationDocuments"
  | "formationDate";
export const LookupLegalStructureById = (id: string | undefined): LegalStructure => {
  return (
    LegalStructures.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
      abbreviation: "",
      requiresPublicFiling: false,
      hasTradeName: false,
      onboardingOrder: 0,
      elementsToDisplay: new Set<ElementsToDisplay>(["entityId", "formationDate"]),
      isCommon: false,
    }
  );
};

export const LegalStructures: LegalStructure[] = [
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship",
    abbreviation: "SP",
    requiresPublicFiling: false,
    onboardingOrder: 30,
    hasTradeName: true,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
    isCommon: true,
  },
  {
    id: "general-partnership",
    name: "General Partnership",
    abbreviation: "GP",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 20,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
    isCommon: false,
  },
  {
    id: "limited-partnership",
    name: "Limited Partnership (LP)",
    abbreviation: "LP",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 70,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: false,
  },
  {
    id: "limited-liability-partnership",
    name: "Limited Liability Partnership (LLP)",
    abbreviation: "LLP",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 60,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: false,
  },
  {
    id: "limited-liability-company",
    name: "Limited Liability Company (LLC)",
    abbreviation: "LLC",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 10,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: true,
  },
  {
    id: "c-corporation",
    name: "Corporation (C designation)",
    abbreviation: "C Corp",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 40,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: true,
  },
  {
    id: "nonprofit",
    name: "Nonprofit",
    abbreviation: "NP",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 45,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: false,
  },
  {
    id: "s-corporation",
    name: "Corporation (and optional S Corp tax designation)",
    abbreviation: "S Corp",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 50,
    elementsToDisplay: new Set([
      "businessName",
      "nexusBusinessElements",
      "formationDocuments",
      "formationDate",
      "entityId",
      "dbaName",
    ]),
    isCommon: true,
  },
];
