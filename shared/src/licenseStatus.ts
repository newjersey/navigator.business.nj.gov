export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

export type LicenseStatusResult = {
  status: LicenseStatus;
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
