export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

export type LicenseStatusResult = {
  status: LicenseStatus;
  expirationISO?: string;
  checklistItems: LicenseStatusItem[];
};

export type CheckoffStatus = "ACTIVE" | "PENDING" | "INCOMPLETE" | "SCHEDULED" | "NOT_APPLICABLE";

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
  | "WITHDRAWN"
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_INTERNAL_REVIEW"
  | "SPECIAL_REVIEW"
  | "PENDING_DEFICIENCIES"
  | "DEFICIENCIES_SUBMITTED"
  | "CHECKLIST_COMPLETED"
  | "APPROVED"
  | "PENDING_RENEWAL"
  | "PENDING_REINSTATEMENT"
  | "INACTIVE"
  | "ABANDONED"
  | "SUSPENDED"
  | "REVOKED";

export interface LicenseData {
  nameAndAddress: LicenseSearchNameAndAddress;
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

export interface LicenseSearchNameAndAddress extends LicenseSearchAddress {
  name: string;
}

export const createEmptyLicenseSearchNameAndAddress = (): LicenseSearchNameAndAddress => {
  return {
    name: "",
    addressLine1: "",
    addressLine2: "",
    zipCode: "",
  };
};

export type LicenseSearchAddress = {
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};
