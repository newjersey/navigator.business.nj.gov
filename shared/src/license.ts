export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

export type LicenseStatusResult = {
  status: LicenseStatus;
  expirationISO?: string;
  checklistItems: LicenseStatusItem[];
};

export type CheckoffStatus = "ACTIVE" | "PENDING" | "UNKNOWN";

export type LicenseStatus =
  | "ACTIVE"
  | "PENDING"
  | "UNKNOWN"
  | "EXPIRED"
  | "BARRED"
  | "OUT_OF_BUSINESS"
  | "REINSTATEMENT_PENDING"
  | "CLOSED"
  | "DELETED"
  | "DENIED"
  | "VOLUNTARY_SURRENDER"
  | "WITHDRAWN";

export interface LicenseData {
  nameAndAddress: NameAndAddress;
  completedSearch: boolean;
  expirationISO?: string;
  lastUpdatedISO: string;
  status: LicenseStatus;
  items: LicenseStatusItem[];
}

export type LicenseEntity = {
  fullName: string;
  addressLine1: string;
  addressCity: string;
  addressState: string;
  addressCounty: string;
  addressZipCode: string;
  professionName: string;
  licenseType: string;
  applicationNumber: string;
  licenseNumber: string;
  licenseStatus: string;
  issueDate: string;
  expirationDate: string;
  checklistItem: string;
  checkoffStatus: "Completed" | "Unchecked" | "Not Applicable";
  dateThisStatus: string;
};

export type NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export const createEmptyNameAndAddress = (): NameAndAddress => {
  return {
    name: "",
    addressLine1: "",
    addressLine2: "",
    zipCode: "",
  };
};
