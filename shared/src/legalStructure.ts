export interface LegalStructure {
  readonly id: string;
  readonly name: string;
  readonly requiresPublicFiling: boolean;
  readonly hasTradeName: boolean;
  readonly onboardingOrder: number;
  readonly displayTaxDisclaimer: boolean;
  readonly displayResponsibleOwnerName: boolean;
  readonly displayBusinessName: boolean;
  readonly displayNexusBusinessElements: boolean;
  readonly displayStartingBusinessDocuments: boolean;
  readonly displayEntityId: boolean;
  readonly displayDbaName: boolean;
  readonly displayOwningDateOfFormation: boolean;
}

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
      displayTaxDisclaimer: false,
      displayResponsibleOwnerName: false,
      displayBusinessName: false,
      displayNexusBusinessElements: false,
      displayStartingBusinessDocuments: false,
      displayEntityId: false,
      displayDbaName: false,
      displayOwningDateOfFormation: false,
    }
  );
};

export const LegalStructures: LegalStructure[] = [
  {
    id: "sole-proprietorship",
    name: "Sole Proprietorship",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 30,
    displayTaxDisclaimer: true,
    displayResponsibleOwnerName: true,
    displayBusinessName: false,
    displayNexusBusinessElements: false,
    displayStartingBusinessDocuments: false,
    displayEntityId: false,
    displayDbaName: false,
    displayOwningDateOfFormation: false,
  },
  {
    id: "general-partnership",
    name: "General Partnership",
    requiresPublicFiling: false,
    hasTradeName: true,
    onboardingOrder: 20,
    displayTaxDisclaimer: true,
    displayResponsibleOwnerName: true,
    displayBusinessName: false,
    displayNexusBusinessElements: false,
    displayStartingBusinessDocuments: false,
    displayEntityId: false,
    displayDbaName: false,
    displayOwningDateOfFormation: false,
  },
  {
    id: "limited-partnership",
    name: "Limited Partnership (LP)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 70,
    displayTaxDisclaimer: false,
    displayResponsibleOwnerName: false,
    displayBusinessName: true,
    displayNexusBusinessElements: true,
    displayStartingBusinessDocuments: true,
    displayEntityId: true,
    displayDbaName: true,
    displayOwningDateOfFormation: true,
  },
  {
    id: "limited-liability-partnership",
    name: "Limited Liability Partnership (LLP)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 60,
    displayTaxDisclaimer: false,
    displayResponsibleOwnerName: false,
    displayBusinessName: true,
    displayNexusBusinessElements: true,
    displayStartingBusinessDocuments: true,
    displayEntityId: true,
    displayDbaName: true,
    displayOwningDateOfFormation: true,
  },
  {
    id: "limited-liability-company",
    name: "Limited Liability Company (LLC)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 10,
    displayTaxDisclaimer: false,
    displayResponsibleOwnerName: false,
    displayBusinessName: true,
    displayNexusBusinessElements: true,
    displayStartingBusinessDocuments: true,
    displayEntityId: true,
    displayDbaName: true,
    displayOwningDateOfFormation: true,
  },
  {
    id: "c-corporation",
    name: "Corporation",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 40,
    displayTaxDisclaimer: false,
    displayResponsibleOwnerName: false,
    displayBusinessName: true,
    displayNexusBusinessElements: true,
    displayStartingBusinessDocuments: true,
    displayEntityId: true,
    displayDbaName: true,
    displayOwningDateOfFormation: true,
  },
  {
    id: "s-corporation",
    name: "Corporation (and optional S Corp tax designation)",
    requiresPublicFiling: true,
    hasTradeName: false,
    onboardingOrder: 50,
    displayTaxDisclaimer: false,
    displayResponsibleOwnerName: false,
    displayBusinessName: true,
    displayNexusBusinessElements: true,
    displayStartingBusinessDocuments: true,
    displayEntityId: true,
    displayDbaName: true,
    displayOwningDateOfFormation: true,
  },
];
