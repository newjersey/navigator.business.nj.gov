import industryJson from "../../content/lib/industry.json";

export interface Industry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly licenseType?: string;
  readonly canHavePermanentLocation: boolean;
  readonly additionalSearchTerms?: string;
  readonly defaultSectorId?: string;
  readonly roadmapSteps: AddOn[];
  readonly modifications?: TaskModification[];
  readonly naicsCodes?: string;
  readonly isEnabled: boolean;
  readonly industryOnboardingQuestions: IndustryOnboardingQuestions;
}

interface IndustryOnboardingQuestions {
  readonly isProvidesStaffingServicesApplicable: boolean;
  readonly isCertifiedInteriorDesignerApplicable: boolean;
  readonly isRealEstateAppraisalManagementApplicable: boolean;
  readonly canBeReseller: boolean;
  readonly isLiquorLicenseApplicable: boolean;
  readonly isCpaRequiredApplicable: boolean;
  readonly canBeHomeBased: boolean;
  readonly isTransportation: boolean;
  readonly isCarServiceApplicable: boolean;
}

export interface AddOn {
  readonly step: number;
  readonly weight: number;
  readonly task: string;
}

export interface TaskModification {
  readonly taskToReplaceFilename: string;
  readonly replaceWithFilename: string;
}

export const LookupIndustryById = (id: string | undefined): Industry => {
  return (
    Industries.find((x) => x.id === id) ?? {
      id: "",
      name: "",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      naicsCodes: "",
      isEnabled: false,
      industryOnboardingQuestions: {
        isProvidesStaffingServicesApplicable: false,
        isCertifiedInteriorDesignerApplicable: false,
        isRealEstateAppraisalManagementApplicable: false,
        canBeReseller: true,
        canBeHomeBased: false,
        isLiquorLicenseApplicable: false,
        isCpaRequiredApplicable: false,
        isTransportation: false,
        isCarServiceApplicable: false,
      },
    }
  );
};

export const Industries: Industry[] = industryJson.industries;

export const isIndustryIdGeneric = (industry: Industry): boolean => {
  return industry.id === "generic";
};
