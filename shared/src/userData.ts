import type { BusinessUser } from "./businessUser";
import type { CigaretteLicenseData } from "./cigaretteLicense";
import type { CrtkData } from "./crtk";
import { createBusinessId } from "./domain-logic/createBusinessId";
import type { EnvironmentData } from "./environment";
import { createEmptyFormationFormData, type FormationData } from "./formationData";
import type { LicenseData } from "./license";
import { createEmptyProfileData, type ProfileData } from "./profileData";
import { emptyRoadmapTaskData, type RoadmapTaskData } from "./roadmapTaskData";
import type { TaxClearanceCertificateData } from "./taxClearanceCertificate";
import type { TaxFilingData } from "./taxFiling";
import type { XrayData } from "./xray";

export interface UserData {
  readonly user: BusinessUser;
  readonly version: number;
  readonly lastUpdatedISO: string;
  readonly dateCreatedISO: string;
  readonly versionWhenCreated: number;
  businesses: Record<string, Business>;
  currentBusinessId: string;
}

export interface Business {
  readonly id: string;
  readonly dateCreatedISO: string;
  readonly lastUpdatedISO: string;
  readonly dateDeletedISO: string;
  readonly profileData: ProfileData;
  readonly onboardingFormProgress: OnboardingFormProgress;
  readonly taskProgress: Record<string, TaskProgress>;
  readonly taskItemChecklist: Record<string, boolean>;
  readonly licenseData: LicenseData | undefined;
  readonly preferences: Preferences;
  readonly taxFilingData: TaxFilingData;
  readonly taxClearanceCertificateData: TaxClearanceCertificateData | undefined;
  readonly cigaretteLicenseData: CigaretteLicenseData | undefined;
  readonly formationData: FormationData;
  readonly environmentData: EnvironmentData | undefined;
  readonly xrayRegistrationData: XrayData | undefined;
  readonly roadmapTaskData: RoadmapTaskData;
  readonly versionWhenCreated: number;
  readonly version: number;
  readonly userId: string;
  readonly crtkData: CrtkData | undefined;
}

export const CURRENT_VERSION = 195;

export const createEmptyBusiness = ({
  userId,
  businessId,
}: {
  userId: string;
  businessId?: string;
}): Business => {
  return {
    id: businessId || createBusinessId(),
    dateCreatedISO: new Date(Date.now()).toISOString(),
    lastUpdatedISO: new Date(Date.now()).toISOString(),
    dateDeletedISO: "",
    profileData: createEmptyProfileData(),
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    licenseData: undefined,
    preferences: {
      roadmapOpenSections: ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"],
      roadmapOpenSteps: [],
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
    taxClearanceCertificateData: undefined,
    cigaretteLicenseData: undefined,
    formationData: {
      formationFormData: createEmptyFormationFormData(),
      formationResponse: undefined,
      getFilingResponse: undefined,
      completedFilingPayment: false,
      businessNameAvailability: undefined,
      dbaBusinessNameAvailability: undefined,
      lastVisitedPageIndex: 0,
    },
    xrayRegistrationData: undefined,
    environmentData: undefined,
    roadmapTaskData: emptyRoadmapTaskData,
    version: CURRENT_VERSION,
    versionWhenCreated: CURRENT_VERSION,
    userId: userId,
    crtkData: undefined,
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
      [businessId]: createEmptyBusiness({ userId: user.id, businessId }),
    },
  };
};

export const sectionNames = ["PLAN", "START", "DOMESTIC_EMPLOYER_SECTION"] as const;
export type SectionType = (typeof sectionNames)[number];

export type TaskProgress = "TO_DO" | "COMPLETED";

export interface Preferences {
  roadmapOpenSections: SectionType[];
  roadmapOpenSteps: number[];
  visibleSidebarCards: string[];
  returnToLink: string;
  isCalendarFullView: boolean;
  isHideableRoadmapOpen: boolean;
  phaseNewlyChanged: boolean;
  isNonProfitFromFunding?: boolean;
}

export type OnboardingFormProgress = "UNSTARTED" | "COMPLETED";
