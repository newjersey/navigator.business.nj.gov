export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
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

export type LicenseDetails = {
  nameAndAddress: LicenseSearchNameAndAddress;
  licenseStatus: LicenseStatus;
  expirationDateISO: string | undefined;
  lastUpdatedISO: string;
  checklistItems: LicenseStatusItem[];
  hasError?: boolean;
};

/*
TODO: Needs to be confirmed with Content

apply-for-shop-license - Which cosmetology license/licenses?
public-accountant-license and register-accounting-firm appear to be duplicative tasks searching the same license
moving-company-license - does this need to support all 4 types?
*/

export const taskIdToLicenseName = {
  "apply-for-shop-license": "Cosmetology and Hairstyling-Shop",
  "appraiser-license": "Real Estate Appraisers-Appraisal Management Company",
  "architect-license": "Architecture-Certificate of Authorization",
  "health-club-registration": "Health Club Services",
  "home-health-aide-license": "Health Care Services",
  "hvac-license": "HVACR-HVACR CE Sponsor",
  "landscape-architect-license": "Landscape Architecture-Certificate of Authorization",
  "license-massage-therapy": "Massage and Bodywork Therapy-Massage and Bodywork EmployerHealth Care Services",
  "moving-company-license": "Public Movers and Warehousemen-Public Mover and Warehouseman",
  "pharmacy-license": "Pharmacy-Pharmacy",
  "public-accountant-license": "Accountancy-Firm Registration",
  "register-accounting-firm": "Accountancy-Firm Registration",
  "register-consumer-affairs": "Home Improvement Contractors-Home Improvement Contractor",
  "ticket-broker-reseller-registration": "Ticket Brokers",
  "telemarketing-license": "Telemarketers",
} as const;

export const getTaskIdFromLicenseName = (licenseName: LicenseName): string | undefined => {
  return Object.keys(taskIdToLicenseName).find(
    (taskId) => taskIdToLicenseName[taskId as keyof typeof taskIdToLicenseName] === licenseName
  );
};
export type LicenseTaskID = keyof typeof taskIdToLicenseName;

export type LicenseName = (typeof taskIdToLicenseName)[LicenseTaskID];

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
