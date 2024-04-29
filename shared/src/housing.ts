import { Municipality } from "./municipality";

export type HousingPropertyInterestDetails = {
  createdOn: string;
  isFireSafety: boolean;
  isBHIRegistered: boolean;
  address: string;
  BHINextInspectionDueDate: string;
  stateCode: number;
};

export type HousingMunicipality = {
  name: string;
  id: string;
  county: string;
};

export type CommunityAffairsAddress = {
  streetAddress1: string;
  streetAddress2?: string;
  municipality: Municipality;
};
