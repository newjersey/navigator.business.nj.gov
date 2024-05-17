import { BusinessUser } from "./businessUser";
import { CountriesShortCodes } from "./countries";
import { createBusinessId } from "./domain-logic/createBusinessId";
import { createEmptyFormationFormData, FormationData } from "./formationData";
import { LicenseData } from "./license";
import { Municipality } from "./municipality";
import { createEmptyProfileData, ProfileData } from "./profileData";
import { StateObject } from "./states";
import { TaxFilingData } from "./taxFiling";

export interface UserData {
  readonly user: BusinessUser;
  readonly version: number;
  readonly lastUpdatedISO: string;
  readonly dateCreatedISO: string;
  readonly versionWhenCreated: number;
  readonly businesses: Record<string, Business>;
  readonly currentBusinessId: string;
}

export interface Business {
  readonly id: string;
  readonly dateCreatedISO: string;
  readonly lastUpdatedISO: string;
  readonly profileData: ProfileData;
  readonly onboardingFormProgress: OnboardingFormProgress;
  readonly taskProgress: Record<string, TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: LicenseData | undefined;
  readonly preferences: Preferences;
  readonly taxFilingData: TaxFilingData;
  readonly formationData: FormationData;
}

export interface Address {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressState?: StateObject;
  readonly addressMunicipality?: Municipality;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
  readonly addressCountry: CountriesShortCodes | undefined;
  readonly businessLocationType: string | undefined;
}

export interface AddressTextFields {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressProvince?: string;
  readonly addressZipCode: string;
}

export interface AddressValidFields {
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressCity?: string;
  readonly addressZipCode: string;
}

export const CURRENT_VERSION = 135;

export const createEmptyBusiness = (id?: string): Business => {
  return {
    id: id || createBusinessId(),
    dateCreatedISO: new Date(Date.now()).toISOString(),
    lastUpdatedISO: new Date(Date.now()).toISOString(),
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START"],
      roadmapOpenSteps: [],
      hiddenCertificationIds: [],
      hiddenFundingIds: [],
      visibleSidebarCards: [],
      returnToLink: "",
      isCalendarFullView: false,
      isHideableRoadmapOpen: false,
      phaseNewlyChanged: true,
    },
    taxFilingData: {
      state: undefined,
      businessName: undefined,
      lastUpdatedISO: undefined,
      registeredISO: undefined,
      filings: [],
    },
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    },
  };
};

export const createEmptyAddress = (): Address => {
  return {
    addressLine1: "",
    addressLine2: "",
    addressCity: "",
    addressMunicipality: undefined,
    addressState: undefined,
    addressZipCode: "",
    addressCountry: undefined,
    businessLocationType: undefined,
  };
};

export const createEmptyUserData = (user: BusinessUser): UserData => {
  const businessId = createBusinessId();
  return {
    version: CURRENT_VERSION,
    user: user,
    lastUpdatedISO: new Date(Date.now()).toISOString(),
    dateCreatedISO: new Date(Date.now()).toISOString(),
    versionWhenCreated: CURRENT_VERSION,
    currentBusinessId: businessId,
    businesses: {
      [businessId]: createEmptyBusiness(businessId),
    },
  };
};

export type AddressTextField = keyof AddressTextFields;
export type AddressFields = keyof Address;
export type FieldsForAddressErrorHandling = keyof Address;

export const sectionNames = ["PLAN", "START"] as const;
export type SectionType = (typeof sectionNames)[number];

export type TaskProgress = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
  hiddenFundingIds: string[];
  hiddenCertificationIds: string[];
  visibleSidebarCards: string[];
  returnToLink: string;
  isCalendarFullView: boolean;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
}

export type OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
