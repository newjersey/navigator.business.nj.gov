import {
  ALL_INDUSTRIES,
  ALL_LEGAL_STRUCTURES,
  BusinessUser,
  Industry,
  LegalStructure,
  LicenseData,
  LicenseEntity,
  LicenseStatusItem,
  LicenseStatusResult,
  Municipality,
  NameAndAddress,
  OnboardingData,
  SelfRegResponse,
  UserData,
} from "./types";
import dayjs from "dayjs";

export const randomInt = (): number => Math.floor(Math.random() * Math.floor(10000000));

export const generateUser = (overrides: Partial<BusinessUser>): BusinessUser => {
  return {
    name: "some-name-" + randomInt(),
    email: `some-email-${randomInt()}@example.com`,
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateUserData = (overrides: Partial<UserData>): UserData => {
  return {
    user: generateUser({}),
    onboardingData: generateOnboardingData({}),
    formProgress: "UNSTARTED",
    taskProgress: {},
    licenseData: generateLicenseData({}),
    ...overrides,
  };
};

export const generateOnboardingData = (overrides: Partial<OnboardingData>): OnboardingData => {
  return {
    businessName: "some-business-name-" + randomInt(),
    industry: randomIndustry(),
    legalStructure: randomLegalStructure(),
    municipality: generateMunicipality({}),
    liquorLicense: false,
    homeBasedBusiness: false,
    constructionRenovationPlan: undefined,
    ...overrides,
  };
};

export const generateMunicipality = (overrides: Partial<Municipality>): Municipality => {
  return {
    displayName: "some-display-name-" + randomInt(),
    name: "some-name-" + randomInt(),
    county: "some-county-" + randomInt(),
    id: "some-id-" + randomInt(),
    ...overrides,
  };
};

export const generateLicenseStatusItem = (overrides: Partial<LicenseStatusItem>): LicenseStatusItem => {
  return {
    title: "some-title-" + randomInt(),
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

export const generateNameAndAddress = (overrides: Partial<NameAndAddress>): NameAndAddress => {
  return {
    name: "some-name-" + randomInt(),
    addressLine1: "some-address-1-" + randomInt(),
    addressLine2: "some-address-2-" + randomInt(),
    zipCode: "some-zipcode-" + randomInt(),
    ...overrides,
  };
};

export const generateLicenseEntity = (overrides: Partial<LicenseEntity>): LicenseEntity => {
  return {
    fullName: "some-name-" + randomInt(),
    addressLine1: "some-address-" + randomInt(),
    addressCity: "some-city-" + randomInt(),
    addressState: "some-state-" + randomInt(),
    addressCounty: "some-county-" + randomInt(),
    addressZipCode: "some-zipcode-" + randomInt(),
    professionName: "some-profession-" + randomInt(),
    licenseType: "some-license-type" + randomInt(),
    applicationNumber: "some-application-number-" + randomInt(),
    licenseNumber: "some-license-number-" + randomInt(),
    licenseStatus: "Active",
    issueDate: "20080404 000000.000" + randomInt(),
    expirationDate: "20091231 000000.000" + randomInt(),
    checklistItem: "some-item-" + randomInt(),
    checkoffStatus: "Completed",
    dateThisStatus: "20100430 000000.000" + randomInt(),
    ...overrides,
  };
};

export const generateLicenseData = (overrides: Partial<LicenseData>): LicenseData => {
  return {
    nameAndAddress: generateNameAndAddress({}),
    completedSearch: true,
    items: [generateLicenseStatusItem({})],
    status: "PENDING",
    lastCheckedStatus: dayjs().toISOString(),
    ...overrides,
  };
};

export const generateSelfRegResponse = (overrides: Partial<SelfRegResponse>): SelfRegResponse => {
  return {
    myNJUserKey: "some-mynj-key-" + randomInt(),
    authRedirectURL: "some-redirect-url-" + randomInt(),
    ...overrides,
  };
};

export const randomLegalStructure = (): LegalStructure => {
  const randomIndex = Math.floor(Math.random() * ALL_LEGAL_STRUCTURES.length);
  return ALL_LEGAL_STRUCTURES[randomIndex];
};

export const randomIndustry = (): Industry => {
  const randomIndex = Math.floor(Math.random() * ALL_INDUSTRIES.length);
  return ALL_INDUSTRIES[randomIndex];
};
