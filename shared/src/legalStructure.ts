export interface LegalStructure {
  readonly id: string;
  readonly name: string;
  readonly requiresPublicFiling: boolean;
  readonly hasTradeName: boolean;
  readonly onboardingOrder: number;
  readonly elementsToDisplay: Set<ElementsToDisplay>;
}
type ElementsToDisplay =
  | "taxIdDisclaimer"
  | "entityId"
  | "responsibleOwnerName"
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
      requiresPublicFiling: false,
      hasTradeName: false,
      onboardingOrder: 0,
      elementsToDisplay: new Set<ElementsToDisplay>(["entityId"]),
    }
  );
};

export const LegalStructures: LegalStructure[] = [
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship",
    requiresPublicFiling: false,
    onboardingOrder: 30,
    hasTradeName: true,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
  },
  {
    id: "general-partnership",
    name: "General Partnership",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 20,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
  },
  {
    id: "limited-partnership",
    name: "Limited Partnership (LP)",
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
  },
  {
    id: "limited-liability-partnership",
    name: "Limited Liability Partnership (LLP)",
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
  },
  {
    id: "limited-liability-company",
    name: "Limited Liability Company (LLC)",
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
  },
  {
    id: "c-corporation",
    name: "Corporation",
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
  },
  {
    id: "s-corporation",
    name: "Corporation (and optional S Corp tax designation)",
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
  },
];
