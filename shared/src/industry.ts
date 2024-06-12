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
  readonly nonEssentialQuestionsIds: string[];
  readonly modifications?: TaskModification[];
  readonly naicsCodes?: string;
  readonly isEnabled: boolean;
  readonly industryOnboardingQuestions: IndustryOnboardingQuestions;
}

interface IndustryOnboardingQuestions {
  readonly isProvidesStaffingServicesApplicable?: boolean;
  readonly isCertifiedInteriorDesignerApplicable?: boolean;
  readonly isRealEstateAppraisalManagementApplicable?: boolean;
  readonly canBeReseller?: boolean;
  readonly isLiquorLicenseApplicable?: boolean;
  readonly isCpaRequiredApplicable?: boolean;
  readonly canBeHomeBased?: boolean;
  readonly isTransportation?: boolean;
  readonly isCarServiceApplicable?: boolean;
  readonly isInterstateLogisticsApplicable?: boolean;
  readonly isInterstateMovingApplicable?: boolean;
  readonly isChildcareForSixOrMore?: boolean;
  readonly willSellPetCareItems?: boolean;
  readonly isPetCareHousingApplicable?: boolean;
  readonly isCannabisLicenseTypeApplicable?: boolean;
  readonly isConstructionTypeApplicable?: boolean;
  readonly isEmploymentTypeApplicable?: boolean;
}

export interface AddOn {
  readonly step: number;
  readonly weight: number;
  readonly task?: string;
  readonly licenseTask?: string;
}

export interface TaskModification {
  readonly taskToReplaceFilename: string;
  readonly replaceWithFilename: string;
}

export const LookupIndustryById = (id: string | undefined): Industry => {
  return (
    Industries.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
      description: "",
      canHavePermanentLocation: true,
      roadmapSteps: [],
      nonEssentialQuestionsIds: [],
      naicsCodes: "",
      isEnabled: false,
      industryOnboardingQuestions: {
        isProvidesStaffingServicesApplicable: undefined,
        isCertifiedInteriorDesignerApplicable: undefined,
        isRealEstateAppraisalManagementApplicable: undefined,
        canBeReseller: undefined,
        canBeHomeBased: undefined,
        isLiquorLicenseApplicable: undefined,
        isCpaRequiredApplicable: undefined,
        isTransportation: undefined,
        isCarServiceApplicable: undefined,
        isInterstateLogisticsApplicable: undefined,
        isInterstateMovingApplicable: undefined,
        isChildcareForSixOrMore: undefined,
        willSellPetCareItems: undefined,
        isPetCareHousingApplicable: undefined,
      },
    }
  );
};

export const Industries: Industry[] = industryJson.industries;

export const isIndustryIdGeneric = (industry: Industry): boolean => {
  return industry.id === "generic";
};
