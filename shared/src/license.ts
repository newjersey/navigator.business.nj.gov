export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

export type CheckoffStatus = "ACTIVE" | "PENDING" | "INCOMPLETE" | "SCHEDULED" | "NOT_APPLICABLE";

export const licenseStatuses: LicenseStatusFromAPI[] = [
  "ACTIVE",
  "PENDING",
  "EXPIRED",
  "BARRED",
  "OUT_OF_BUSINESS",
  "REINSTATEMENT_PENDING",
  "CLOSED",
  "DELETED",
  "DENIED",
  "VOLUNTARY_SURRENDER",
  "WITHDRAWN",
  "DRAFT",
  "SUBMITTED",
  "UNDER_INTERNAL_REVIEW",
  "SPECIAL_REVIEW",
  "PENDING_DEFICIENCIES",
  "DEFICIENCIES_SUBMITTED",
  "CHECKLIST_COMPLETED",
  "APPROVED",
  "PENDING_RENEWAL",
  "PENDING_REINSTATEMENT",
  "INACTIVE",
  "ABANDONED",
  "SUSPENDED",
  "REVOKED",
];

export type LicenseStatus = LicenseStatusFromAPI | LicenseStatusForError;

export type LicenseStatusForError = "UNKNOWN";
export type LicenseStatusFromAPI =
  | "ACTIVE"
  | "PENDING"
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

export type LicenseDetails = {
  nameAndAddress: LicenseSearchNameAndAddress;
  licenseStatus: LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: LicenseStatusItem[];
};

export const enabledLicensesSources = {
  "Consulting Firms/Temporary Help Services-Consulting Firm": "RGB",
  "Consulting Firms/Temporary Help Services-Consulting Firm/Temporary Help Service": "RGB",
  "Consulting Firms/Temporary Help Services-Temporary Help Service": "RGB",
  "Employment & Personnel Service-Career Counseling Service": "RGB",
  "Employment & Personnel Service-Employment Agency": "RGB",
  "Employment & Personnel Service-Entertainment/Booking Agency": "RGB",
  "Employment & Personnel Service-Nurses Registry": "RGB",
  "Employment & Personnel Service-Resume Service": "RGB",
  "Health Care Services": "RGB",
  "Health Club Services": "RGB",
  Telemarketers: "RGB",
  "Ticket Brokers": "RGB",
};

export const taskIdLicenseNameMapping = {
  "apply-for-shop-license": "Cosmetology and Hairstyling-Shop",
  "appraiser-license": "Real Estate Appraisers-Appraisal Management Company",
  "architect-license": "Architecture-Certificate of Authorization",
  "electrologist-office-license": "Electrologists-Premises",
  "health-club-registration": "Health Club Services",
  "home-health-aide-license": "Health Care Services",
  "hvac-license": "HVACR-HVACR CE Sponsor",
  "landscape-architect-license": "Landscape Architecture-Certificate of Authorization",
  "license-massage-therapy": "Massage and Bodywork Therapy-Massage and Bodywork Employer",
  "moving-company-license": "Public Movers and Warehousemen-Public Mover and Warehouseman",
  "pharmacy-license": "Pharmacy-Pharmacy",
  "register-accounting-firm": "Accountancy-Firm Registration",
  "register-home-contractor": "Home Improvement Contractors-Home Improvement Business Contr",
  "ticket-broker-reseller-registration": "Ticket Brokers",
  "telemarketing-license": "Telemarketers",
  "entertainment-agency-reg": "Employment & Personnel Service-Entertainment/Booking Agency",
  "cemetery-certificate": "Cemetery-Cemetery",
  "consulting-firm-headhunter-reg": "Consulting Firms/Temporary Help Services-Consulting Firm",
  "temp-help-consulting-firm-combined-reg":
    "Consulting Firms/Temporary Help Services-Consulting Firm/Temporary Help Service",
  "temporary-help-service-firm-reg": "Consulting Firms/Temporary Help Services-Temporary Help Service",
  "search-licenses-employment-agency": "Employment & Personnel Service-Employment Agency",
  "funeral-registration": "Mortuary Science-Funeral Home",
  "oos-pharmacy-registration": "Pharmacy-Out of State Pharmacy",
} as const;

export const LicenseNameTaskIdMapping = Object.fromEntries(
  Object.entries(taskIdLicenseNameMapping).map(([key, value]) => [value, key])
);

export type LicenseTaskId = keyof typeof taskIdLicenseNameMapping;

export type LicenseName = (typeof taskIdLicenseNameMapping)[LicenseTaskId];

export type Licenses = Partial<Record<LicenseName, LicenseDetails>>;

export interface LicenseData {
  lastUpdatedISO: string;
  licenses?: Licenses;
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

export const licenseSearchDateFormat = "MMMM D, YYYY";
