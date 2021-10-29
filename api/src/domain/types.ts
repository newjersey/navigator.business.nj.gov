import * as https from "https";

export interface UserDataClient {
  get: (userId: string) => Promise<UserData>;
  findByEmail: (email: string) => Promise<UserData | undefined>;
  put: (userData: UserData) => Promise<UserData>;
}

export interface BusinessNameClient {
  search: (name: string) => Promise<string[]>;
}

export interface LicenseStatusClient {
  search: (name: string, zipCode: string, licenseType: string) => Promise<LicenseEntity[]>;
}

export type SectionType = "PLAN" | "START" | "OPERATE";

export interface SelfRegClient {
  grant: (user: BusinessUser) => Promise<SelfRegResponse>;
  resume: (authID: string) => Promise<SelfRegResponse>;
}

export type SelfRegResponse = {
  authRedirectURL: string;
  myNJUserKey: string;
};

export type SearchBusinessName = (name: string) => Promise<NameAvailability>;
export type SearchLicenseStatus = (
  nameAndAddress: NameAndAddress,
  licenseType: string
) => Promise<LicenseStatusResult>;
export type UpdateLicenseStatus = (userId: string, nameAndAddress: NameAndAddress) => Promise<UserData>;
export type GetCertHttpsAgent = () => Promise<https.Agent>;

export type NameAndAddress = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  zipCode: string;
};

export interface LicenseData {
  nameAndAddress: NameAndAddress;
  completedSearch: boolean;
  lastCheckedStatus: string;
  status: LicenseStatus;
  items: LicenseStatusItem[];
}

export type LicenseStatusResult = {
  status: LicenseStatus;
  checklistItems: LicenseStatusItem[];
};

export type LicenseStatusItem = {
  title: string;
  status: CheckoffStatus;
};

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

export type NameAvailability = {
  status: "AVAILABLE" | "UNAVAILABLE";
  similarNames: string[];
};

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface UserData {
  user: BusinessUser;
  onboardingData: OnboardingData;
  formProgress: FormProgress;
  taskProgress: Record<string, TaskProgress>;
  licenseData: LicenseData | undefined;
  preferences: Preferences;
  taxFilings: TaxFiling[];
}

export type TaxFiling = {
  identifier: string;
  dueDate: string;
};

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
}

export interface OnboardingData {
  businessName: string;
  industryId: string | undefined;
  legalStructureId: string | undefined;
  municipality: Municipality | undefined;
  liquorLicense: boolean;
  homeBasedBusiness: boolean;
  constructionRenovationPlan: boolean | undefined;
  dateOfFormation: string | undefined;
  entityId: string | undefined;
  employerId: string | undefined;
  taxId: string | undefined;
  notes: string;
}

export type Municipality = {
  name: string;
  displayName: string;
  county: string;
  id: string;
};

export type FormProgress = "UNSTARTED" | "COMPLETED";

export type BusinessUser = {
  name?: string;
  email: string;
  id: string;
  myNJUserKey?: string;
};

export const createEmptyUserData = (user: BusinessUser): UserData => {
  return {
    user: user,
    onboardingData: createEmptyOnboardingData(),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
    },
    taxFilings: [],
  };
};

export const createEmptyOnboardingData = (): OnboardingData => {
  return {
    businessName: "",
    industryId: undefined,
    legalStructureId: undefined,
    municipality: undefined,
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    dateOfFormation: undefined,
    entityId: undefined,
    employerId: undefined,
    taxId: undefined,
    notes: "",
  };
};
