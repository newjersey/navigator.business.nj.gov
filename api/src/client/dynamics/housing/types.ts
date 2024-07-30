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
  buildingCount: number;
};

export type HousingPropertyInterestResponse = HousingPropertyInterest | undefined;

export type HousingPropertyInterestInfo = (
  address: string,
  municipalityId: string
) => Promise<HousingPropertyInterestResponse>;

export interface HotelMotelRegistrationClient {
  getHotelMotelRegistration: (
    accessToken: string,
    propertyInterestId: string,
    buildingCount: number
  ) => Promise<HousingRegistrationRequestResponse>;
}

export type HousingRegistrationRequest = {
  date: string;
  propertyInterestType: number;
  id: string;
  status: string;
  buildingCount: number;
};

export type HousingRegistrationRequestResponse = HousingRegistrationRequest[];

export type HousingRegistrationRequestLookupResponse = {
  registrations: HousingRegistrationRequest[];
  lookupStatus: HousingRegistrationLookupStatus;
};

export type HousingRegistrationLookupStatus =
  | "SUCCESSFUL"
  | "NO REGISTRATIONS FOUND"
  | "NO PROPERTY INTERESTS FOUND";

export type HousingRegistrationRequestResponseInfo = (
  address: string,
  municipalityId: string
) => Promise<HousingRegistrationRequestLookupResponse>;

export type PropertyInterestTypes =
  | "Multiple Dwelling"
  | "Hotel"
  | "Motel"
  | "Condominium"
  | "Private Dormitory"
  | "UNRECOGNIZED STATUS";

export function getPropertyInterestTypeIntegerFromTitle(title: PropertyInterestTypes): number {
  switch (title) {
    case "Multiple Dwelling":
      return 240000000;
    case "Hotel":
      return 240000001;
    case "Motel":
      return 240000016;
    default:
      return -1;
  }
}

export type HousingRegistrationStatus =
  | "Approved"
  | "Incomplete"
  | "Returned"
  | "Rejected"
  | "In Review"
  | "Cancelled"
  | "UNRECOGNIZED STATUS";
