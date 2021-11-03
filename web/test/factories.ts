import {
  BusinessUser,
  LicenseData,
  LicenseStatusItem,
  LicenseStatusResult,
  NameAndAddress,
  NameAvailability,
  ProfileData,
  Preferences,
  Roadmap,
  SectionCompletion,
  SectionType,
  Step,
  Task,
  TaskLink,
  TaxFiling,
  UserData,
  TaxFilingData,
} from "@/lib/types/types";
import {
  Industry,
  Industries,
  LegalStructure,
  LegalStructures,
  Municipality,
  MunicipalityDetail,
} from "@businessnjgovnavigator/shared";
import dayjs from "dayjs";
import { getSectionNames } from "@/lib/utils/helpers";

export const randomInt = (length = 8): number =>
  Math.floor(
    Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)
  );

export const generateSectionType = (): SectionType => {
  const num = randomInt();
  return num % 2 ? "PLAN" : "START";
};

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: `some-name-${randomInt()}`,
    email: `some-email-${randomInt()}@example.com`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    user: generateUser({}),
    profileData: generateProfileData({}),
    formProgress: "COMPLETED",
    taskProgress: {},
    licenseData: generateLicenseData({}),
    preferences: generatePreferences({}),
    taxFilingData: generateTaxFilingData({}),
    ...overrides,
  };
};

export const generateTaxFilingData = (overrides: Partial<TaxFilingData>): TaxFilingData => {
  return {
    entityIdStatus: "UNKNOWN",
    filings: [generateTaxFiling({})],
    ...overrides,
  };
};

export const generateTaxFiling = (overrides: Partial<TaxFiling>): TaxFiling => {
  return {
    identifier: `some-identifier-${randomInt()}`,
    dueDate: dayjs().format("YYYY-MM-DD"),
    ...overrides,
  };
};

export const generateProfileData = (
  overrides: Partial<ProfileData>,
  isMobileLocation?: boolean
): ProfileData => {
  return {
    businessName: `some-business-name-${randomInt()}`,
    industryId: randomIndustry(isMobileLocation).id,
    legalStructureId: randomLegalStructure().id,
    municipality: generateMunicipality({}),
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    dateOfFormation: dayjs().format("YYYY-MM"),
    entityId: randomInt(10).toString(),
    employerId: randomInt(9).toString(),
    taxId: randomInt(9).toString(),
    notes: `some-notes-${randomInt()}`,
    ...overrides,
  };
};

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: `some-display-name-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    county: `some-county-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    ...overrides,
  };
};

export const generateMunicipalityDetail = (overrides: Partial<MunicipalityDetail>): MunicipalityDetail => {
  return {
    id: `some-id-${randomInt()}`,
    townName: `some-town-name-${randomInt()}`,
    countyId: `some-county-id-${randomInt()}`,
    townDisplayName: `some-town-display-name-${randomInt()}`,
    townWebsite: `some-town-website-${randomInt()}`,
    countyName: `some-county-name-${randomInt()}`,
    countyClerkPhone: `some-phone-${randomInt()}`,
    countyClerkWebsite: `some-clerk-webpage-${randomInt()}`,
    countyWebsite: `some-county-website-${randomInt()}`,
    ...overrides,
  };
};

export const generatePreferences = (overrides: Partial<Preferences>): Preferences => {
  return {
    roadmapOpenSections: ["PLAN", "START"],
    roadmapOpenSteps: [randomInt()],
    ...overrides,
  };
};

export const generateRoadmap = (overrides: Partial<Roadmap>): Roadmap => {
  return {
    steps: [generateStep({})],
    ...overrides,
  };
};

export const generateSectionCompletion = (
  roadmap: Partial<Roadmap>,
  overrides: Partial<SectionCompletion>
): SectionCompletion => {
  const sectionNames = getSectionNames(roadmap as Roadmap);
  return {
    ...sectionNames.reduce((accumulator, currentValue: SectionType) => {
      accumulator[currentValue] = false;
      return accumulator;
    }, {} as SectionCompletion),
    ...overrides,
  };
};

export const generateStep = (overrides: Partial<Step>): Step => {
  return {
    step_number: randomInt(),
    name: `some-name-${randomInt()}`,
    timeEstimate: `some-time-estimate-${randomInt()}`,
    description: `some-description-${randomInt()}`,
    tasks: [generateTask({})],
    section: generateSectionType(),
    ...overrides,
  };
};

export const generateTask = (overrides: Partial<Task>): Task => {
  return {
    id: `some-id-${randomInt()}`,
    name: `some-name-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    urlSlug: `some-urlSlug-${randomInt()}`,
    callToActionLink: `some-link-${randomInt()}`,
    callToActionText: `some-call-to-action-${randomInt()}`,
    contentMd: `some-content-md-${randomInt()}`,
    postOnboardingQuestion: `some-post-onboarding-${randomInt()}`,
    unlockedBy: [generateTaskLink({})],
    unlocks: [generateTaskLink({})],
    ...overrides,
  };
};

export const generateTaskLink = (overrides: Partial<TaskLink>): TaskLink => {
  return {
    name: `some-name-${randomInt()}`,
    id: `some-id-${randomInt()}`,
    urlSlug: `some-urlSlug-${randomInt()}`,
    filename: `some-filename-${randomInt()}`,
    ...overrides,
  };
};

export const generateNameAvailability = (overrides: Partial<NameAvailability>): NameAvailability => {
  return {
    status: "UNAVAILABLE",
    similarNames: [`some-name-${randomInt()}`],
    ...overrides,
  };
};

export const generateNameAndAddress = (overrides: Partial<NameAndAddress>): NameAndAddress => {
  return {
    name: `some-name-${randomInt()}`,
    addressLine1: `some-address-1-${randomInt()}`,
    addressLine2: `some-address-2-${randomInt()}`,
    zipCode: `some-zipcode-${randomInt()}`,
    ...overrides,
  };
};

export const generateLicenseStatusItem = (overrides: Partial<LicenseStatusItem>): LicenseStatusItem => {
  return {
    title: `some-title-${randomInt()}`,
    status: "ACTIVE",
    ...overrides,
  };
};

export const generateLicenseStatusResult = (overrides: Partial<LicenseStatusResult>): LicenseStatusResult => {
  return {
    status: "PENDING",
    checklistItems: [generateLicenseStatusItem({})],
    ...overrides,
  };
};

export const generateLicenseData = (overrides: Partial<LicenseData>): LicenseData => {
  return {
    nameAndAddress: generateNameAndAddress({}),
    completedSearch: false,
    items: [generateLicenseStatusItem({})],
    status: "PENDING",
    lastCheckedStatus: dayjs().toISOString(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * LegalStructures.length);
  return LegalStructures[randomIndex];
};

export const randomIndustry = (isMobileLocation = false): Industry => {
  const filteredIndustries = Industries.filter((x) => x.isMobileLocation === isMobileLocation);
  const randomIndex = Math.floor(Math.random() * filteredIndustries.length);
  return filteredIndustries[randomIndex];
};
