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
  modelNumber?: string;
  serialNumber?: string;
  annualFee?: number;
};

export type XrayRegistrationStatusResponse = {
  machines: MachineDetails[];
  status?: XrayRegistrationStatus;
  expirationDate?: string;
  deactivationDate?: string;
};

export type XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";

export type XrayRegistrationEntry = {
  registrationNumber: string;
  roomId?: string;
  registrationCategory?: string;
  name?: string;
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
