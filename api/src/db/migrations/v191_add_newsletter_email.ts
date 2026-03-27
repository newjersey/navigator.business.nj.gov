import {
  v190Business,
  v190BusinessUser,
  v190UserData,
} from "@db/migrations/v190_remove_hidden_fundings_and_certifications";
import { randomInt } from "@shared/intHelpers";

export const migrate_v190_to_v191 = (userData: v190UserData): v191UserData => {
  return {
    ...userData,
    user: migrate_v190BusinessUser_to_v191BusinessUser(userData.user),
    businesses: Object.fromEntries(
      Object.values(userData.businesses)
        .map((business: v190Business) => ({ ...business, version: 191 }))
        .map((currBusiness) => [currBusiness.id, currBusiness]),
    ),
    version: 191,
  };
};

const migrate_v190BusinessUser_to_v191BusinessUser = (user: v190BusinessUser): v191BusinessUser => {
  return {
    ...user,
  };
};

// v191 is a passthrough migration that adds newsletterEmail?: string to BusinessUser
// All other types are unchanged from v190
export type v191BusinessUser = v190BusinessUser & {
  newsletterEmail?: string;
};

export type v191Business = Omit<v190Business, "version"> & { version: number };

export type v191UserData = Omit<v190UserData, "user" | "businesses" | "version"> & {
  user: v191BusinessUser;
  businesses: Record<string, v191Business>;
  version: number;
};

// ---------------- v191 generators ----------------

export const generatev191UserData = (overrides: Partial<v191UserData>): v191UserData => {
  return {
    user: generatev191BusinessUser({}),
    version: 191,
    lastUpdatedISO: "",
    dateCreatedISO: "",
    versionWhenCreated: 141,
    businesses: {
      "123": generatev191Business({ id: "123" }),
    },
    currentBusinessId: "",
    ...overrides,
  };
};

export const generatev191BusinessUser = (
  overrides: Partial<v191BusinessUser>,
): v191BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    receiveNewsletter: true,
    userTesting: true,
    receiveUpdatesAndReminders: true,
    externalStatus: {},
    myNJUserKey: undefined,
    intercomHash: undefined,
    abExperience: "ExperienceA",
    accountCreationSource: `some-source-${randomInt()}`,
    contactSharingWithAccountCreationPartner: true,
    phoneNumber: undefined,
    ...overrides,
  };
};

export const generatev191Business = (overrides: Partial<v191Business>): v191Business => {
  return {
    id: `some-id-${randomInt()}`,
    dateCreatedISO: "",
    lastUpdatedISO: "",
    dateDeletedISO: "",
    profileData: {} as v191Business["profileData"],
    preferences: {
      roadmapOpenSections: [],
      roadmapOpenSteps: [],
      visibleSidebarCards: [],
      returnToLink: "",
      isCalendarFullView: false,
      isHideableRoadmapOpen: false,
      phaseNewlyChanged: false,
    },
    formationData: {} as v191Business["formationData"],
    onboardingFormProgress: "UNSTARTED",
    taskProgress: {},
    taskItemChecklist: {},
    roadmapTaskData: {},
    licenseData: undefined,
    taxFilingData: { filings: [] },
    environmentData: undefined,
    xrayRegistrationData: undefined,
    crtkData: undefined,
    taxClearanceCertificateData: undefined,
    cigaretteLicenseData: undefined,
    userId: `some-id-${randomInt()}`,
    version: 191,
    versionWhenCreated: -1,
    ...overrides,
  };
};
