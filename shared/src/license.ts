import { NameAndAddress } from "./misc";

export type LicenseStatusItem = {
  readonly title: string;
  readonly status: CheckoffStatus;
};

export type LicenseStatusResult = {
  readonly status: LicenseStatus;
  readonly checklistItems: readonly LicenseStatusItem[];
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
  readonly nameAndAddress: NameAndAddress;
  readonly completedSearch: boolean;
  readonly lastCheckedStatus: string;
  readonly status: LicenseStatus;
  readonly items: readonly LicenseStatusItem[];
}

export type LicenseEntity = {
  readonly fullName: string;
  readonly addressLine1: string;
  readonly addressCity: string;
  readonly addressState: string;
  readonly addressCounty: string;
  readonly addressZipCode: string;
  readonly professionName: string;
  readonly licenseType: string;
  readonly applicationNumber: string;
  readonly licenseNumber: string;
  readonly licenseStatus: string;
  readonly issueDate: string;
  readonly expirationDate: string;
  readonly checklistItem: string;
  readonly checkoffStatus: "Completed" | "Unchecked" | "Not Applicable";
  readonly dateThisStatus: string;
};
