export type XrayData = {
  facilityDetails: FacilityDetails;
  machines: MachineDetails[];
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  expirationDate: string;
  deactivatedDate?: string;
};

export type FacilityDetails = {
  businessName?: string;
  addressLine1?: string;
  addressLine2?: string;
  addressZipCode?: string;
};

export type MachineDetails = {
  name: string;
  registrationNumber: string;
  roomId: string;
  registrationCategory: string;
  manufacturer: string;
  modelNumber: string;
  serialNumber: string;
  annualFee: number;
};

export type XrayRegistrationStatusResponse = {
  machines: MachineDetails[];
  status: "ACTIVE" | "EXPIRED" | "INACTIVE";
  expirationDate: string;
  deactivatedDate?: string;
};

export type XraySearchError = "NOT_FOUND" | "FIELDS_REQUIRED" | "SEARCH_FAILED";

export type XrayRegistrationStatus = "ACTIVE" | "EXPIRED" | "INACTIVE";
