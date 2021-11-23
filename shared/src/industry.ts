import industryJson from "../../content/src/industry.json";

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
    }
  );
};

export const Industries: Industry[] = industryJson.industries;
