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

export type HousingAddress = {
  address1: string;
  address2?: string;
  municipalityExternalId?: string;
  municipalityName?: string;
};

export type HousingRegistrationRequest = {
  date: string;
  propertyInterestType: number;
  id: string;
  status: string;
  buildingCount: number;
};

export type HousingRegistrationRequestLookupResponse = {
  registrations: HousingRegistrationRequest[];
  lookupStatus: string;
  renewalDate?: string;
};

export type PropertyInterestType = "hotelMotel" | "multipleDwelling";
