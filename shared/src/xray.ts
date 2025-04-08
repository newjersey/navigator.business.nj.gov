import { UserData } from "src/userData";

export type XrayData = {
  facilityDetails?: FacilityDetails;
  machines?: MachineDetails[];
  status?: XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type FacilityDetails = {
  businessName: string;
  addressLine1: string;
  addressLine2?: string;
  addressZipCode: string;
};

export type MachineDetails = {
  name?: string;
  registrationNumber?: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type XrayRegistrationStatusResponse = {
  machines: MachineDetails[];
  status: XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export type XrayRegistrationEntry = {
  registrationNumber: string;
  roomId?: string;
  registrationCategory?: string;
  manufacturer?: string;
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
  expirationDate?: string;
  deactivationDate?: string;
  disposalDate?: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  status: string;
  businessName: string;
  contactType: string;
};

export type XraySearchError = "NOT_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

export interface XrayRegistrationStatusLookup {
  getStatus: (
    businessName: string,
    addressLine1: string,
    addressZipCode: string
  ) => Promise<XrayRegistrationStatusResponse>;
}

export interface XrayRegistrationSearch {
  searchByAddress: (addressLine1: string, addressZipCode: string) => Promise<XrayRegistrationEntry[]>;
  searchByBusinessName: (businessName: string) => Promise<XrayRegistrationEntry[]>;
}

export type UpdateXrayRegistration = (
  userData: UserData,
  facilityDetails: FacilityDetails
) => Promise<UserData>;

export type XrayRegistrationErrors = "NO_ENTRIES_FOUND";
