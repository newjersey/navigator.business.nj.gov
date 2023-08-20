import FundingAgenciesJSON from "../../content/src/mappings/fundingAgency.json";

export interface FundingAgency {
  readonly id: string;
  readonly name: string;
}

export const LookupFundingAgencyById = (id: string): FundingAgency => {
  return (
    arrayOfFundingAgencies.find((x) => {
      return x.id === id;
    }) ?? {
      id: "",
      name: "",
    }
  );
};

export const arrayOfFundingAgencies: FundingAgency[] = FundingAgenciesJSON.arrayOfFundingAgencies;
