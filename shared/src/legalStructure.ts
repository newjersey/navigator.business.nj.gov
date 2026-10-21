export interface LegalStructure {
  readonly id: string;
  readonly abbreviation: string;
  readonly requiresPublicFiling: boolean;
  readonly hasTradeName: boolean;
  readonly isCommon: boolean;
  readonly orderWeight: number;
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
      abbreviation: "",
      requiresPublicFiling: false,
      hasTradeName: false,
      orderWeight: 0,
      elementsToDisplay: new Set<ElementsToDisplay>(["entityId", "formationDate"]),
      isCommon: false,
    }
  );
};

export const LegalStructures: LegalStructure[] = [
  {
    id: "sole-proprietorship",
    abbreviation: "SP",
    requiresPublicFiling: false,
    orderWeight: 30,
    hasTradeName: true,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
    isCommon: true,
  },
  {
    id: "general-partnership",
    abbreviation: "GP",
    requiresPublicFiling: false,
    hasTradeName: true,
    orderWeight: 20,
    elementsToDisplay: new Set(["taxIdDisclaimer", "responsibleOwnerName"]),
    isCommon: false,
  },
  {
    id: "limited-partnership",
    abbreviation: "LP",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 70,
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
    abbreviation: "LLP",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 60,
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
    abbreviation: "LLC",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 10,
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
    abbreviation: "C Corp",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 40,
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
    abbreviation: "NP",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 45,
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
    abbreviation: "S Corp",
    requiresPublicFiling: true,
    hasTradeName: false,
    orderWeight: 50,
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
