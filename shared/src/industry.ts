import industryJson from "../../content/lib/industry.json";

export interface Industry {
  id: string;
  name: string;
  description: string;
  canBeHomeBased: boolean;
  isLiquorLicenseApplicable: boolean;
  licenseType?: string;
  isMobileLocation: boolean;
  canBeReseller: boolean;
  additionalSearchTerms?: string;
  defaultSectorId?: string;
  roadmapSteps: AddOn[];
  modifications?: TaskModification[];
}

export interface AddOn {
  step: number;
  weight: number;
  task: string;
}
export interface TaskModification {
  taskToReplaceFilename: string;
  replaceWithFilename: string;
}

export const LookupIndustryById = (id: string | undefined): Industry => {
  return (
    Industries.find((x) => x.id === id) ?? {
      id: "",
      name: "",
      description: "",
      canBeHomeBased: false,
      isLiquorLicenseApplicable: false,
      isMobileLocation: false,
      canBeReseller: true,
      roadmapSteps: [],
    }
  );
};

export const Industries: Industry[] = industryJson.industries;
