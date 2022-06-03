import industryJson from "../../content/lib/industry.json";

export interface Industry {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly canBeHomeBased: boolean;
  readonly isLiquorLicenseApplicable: boolean;
  readonly isCpaRequiredApplicable: boolean;
  readonly licenseType?: string;
  readonly isMobileLocation: boolean;
  readonly canBeReseller: boolean;
  readonly additionalSearchTerms?: string;
  readonly defaultSectorId?: string;
  readonly roadmapSteps: AddOn[];
  readonly modifications?: TaskModification[];
  readonly naicsCodes?: string;
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
      canBeHomeBased: false,
      isLiquorLicenseApplicable: false,
      isCpaRequiredApplicable: false,
      isMobileLocation: false,
      canBeReseller: true,
      roadmapSteps: [],
      naicsCodes: "",
    }
  );
};

export const Industries: Industry[] = industryJson.industries;

export const isIndustryIdGeneric = (industry: Industry): boolean => {
  return industry.id === "generic";
};
