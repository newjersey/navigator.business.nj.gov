export interface HousingPropertyInterestClient {
  getPropertyInterest: (
    accessToken: string,
    address: string,
    municipalityId: string
  ) => Promise<HousingPropertyInterestResponse>;
}

export type HousingPropertyInterest = {
  createdOn: string;
  isFireSafety: boolean;
  isBHIRegistered: boolean;
  address: string;
  BHINextInspectionDueDate: string;
  stateCode: number;
  id: string;
};

export type HousingPropertyInterestResponse = HousingPropertyInterest | undefined;

export type HousingPropertyInterestInfo = (
  address: string,
  municipalityId: string
) => Promise<HousingPropertyInterestResponse>;
