export interface HousingPropertyInterestClient {
  getPropertyInterestsByAddress: (accessToken: string, address: string) => Promise<HousingPropertyInterest[]>;
}

export type HousingPropertyInterest = {
  createdOn: string;
  isFireSafety: boolean;
  isBHIRegistered: boolean;
  address: string;
  BHINextInspectionDueDate: string;
  stateCode: number;
};

export type HousingPropertyInterestInfo = (address: string) => Promise<HousingPropertyInterest[]>;
